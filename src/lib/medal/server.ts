import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";
import {
  DEFAULT_COPY,
  DEFAULT_PIN,
  SEED_SCHOOLS,
  type Board,
  type Contingent,
  type Settings,
} from "@/lib/medal/model";

const imagePattern = /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=\s]+$/i;

const imageField = (max: number, label: string) =>
  z
    .string()
    .max(max, `${label} terlalu besar.`)
    .refine((value) => value === "" || imagePattern.test(value), `${label} harus berupa gambar.`);

const settingsSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi.").max(80, "Judul terlalu panjang."),
  subtitle: z.string().trim().min(1, "Subjudul wajib diisi.").max(160, "Subjudul terlalu panjang."),
  tagline: z.string().trim().min(1, "Tulisan tambahan wajib diisi.").max(120, "Tulisan tambahan terlalu panjang."),
  eventNote: z.string().trim().max(280, "Informasi acara terlalu panjang."),
  logo1: imageField(120_000, "Logo penyelenggara"),
  logo2: imageField(120_000, "Logo penyelenggara"),
  logo3: imageField(120_000, "Logo penyelenggara"),
  background: imageField(280_000, "Latar"),
  colorNavy: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna latar tidak valid."),
  colorGold: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna emas tidak valid."),
  colorAccent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna aksen tidak valid."),
  colorPaper: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna teks tidak valid."),
});

const contingentSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/, "Identitas kontingen tidak valid."),
  name: z.string().trim().min(1, "Nama kontingen wajib diisi.").max(80, "Nama kontingen terlalu panjang."),
  logo: imageField(80_000, "Logo kontingen"),
  gold: z.number().int().min(0).max(999),
  silver: z.number().int().min(0).max(999),
  bronze: z.number().int().min(0).max(999),
});

const saveSchema = z.object({
  pin: z.string().min(4, "PIN minimal 4 karakter.").max(40),
  settings: settingsSchema,
  contingents: z.array(contingentSchema).max(80, "Maksimal 80 kontingen."),
});

const pinSchema = z.object({
  pin: z.string().min(4, "PIN minimal 4 karakter.").max(40),
});

const changePinSchema = z.object({
  pin: z.string().min(4).max(40),
  nextPin: z.string().min(4, "PIN baru minimal 4 karakter.").max(40, "PIN baru terlalu panjang."),
});

function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Data tidak valid.");
  }
  return result.data;
}

function asIso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
}

function asInt(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : 0;
}

function asBool(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1;
}

function asText(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function pinMatches(input: string, stored: string) {
  const left = input.normalize("NFKC");
  const right = stored.normalize("NFKC");
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  }
  return diff === 0 && left.length > 0;
}

async function readBoard(sql: Sql, seeding = false): Promise<Board> {
  const metaRows = await sql<Record<string, unknown>>`
    select
      title,
      subtitle,
      tagline,
      event_note,
      logo1,
      logo2,
      logo3,
      background,
      color_navy,
      color_gold,
      color_accent,
      color_paper,
      pin,
      seeded,
      updated_at
    from board_meta
    where id = 1
  `;
  const meta = metaRows[0];
  if (!meta) throw new Error("Data klasemen belum siap.");
  if (!asBool(meta.seeded)) {
    if (seeding) throw new Error("Data awal gagal disiapkan.");
    for (const school of SEED_SCHOOLS) {
      await sql`
        insert into contingents (id, name, logo, gold, silver, bronze)
        values (${school.id}, ${school.name}, '', 0, 0, 0)
        on conflict (id) do nothing
      `;
    }
    await sql`update board_meta set seeded = true, updated_at = now() where id = 1`;
    return readBoard(sql, true);
  }
  const teamRows = await sql<Record<string, unknown>>`
    select id, name, logo, gold, silver, bronze, updated_at
    from contingents
  `;
  const settings: Settings = {
    title: asText(meta.title),
    subtitle: asText(meta.subtitle),
    tagline: asText(meta.tagline),
    eventNote: asText(meta.event_note),
    logo1: asText(meta.logo1),
    logo2: asText(meta.logo2),
    logo3: asText(meta.logo3),
    background: asText(meta.background),
    colorNavy: asText(meta.color_navy),
    colorGold: asText(meta.color_gold),
    colorAccent: asText(meta.color_accent),
    colorPaper: asText(meta.color_paper),
    pinIsDefault: asText(meta.pin) === DEFAULT_PIN,
    updatedAt: asIso(meta.updated_at),
  };
  const contingents: Contingent[] = teamRows.map((row) => ({
    id: asText(row.id),
    name: asText(row.name),
    logo: asText(row.logo),
    gold: asInt(row.gold),
    silver: asInt(row.silver),
    bronze: asInt(row.bronze),
    updatedAt: asIso(row.updated_at),
  }));
  return { settings, contingents };
}

async function requirePin(pin: string) {
  const sql = await getSql();
  const rows = await sql<{ pin: string }>`select pin from board_meta where id = 1`;
  const stored = rows[0]?.pin ?? "";
  if (!pinMatches(pin, stored)) throw new Error("PIN salah.");
  return sql;
}

async function writeTeams(
  sql: Sql,
  contingents: z.infer<typeof contingentSchema>[],
) {
  const ids = contingents.map((row) => row.id);
  if (new Set(ids).size !== ids.length) throw new Error("Ada kontingen dengan identitas ganda.");
  const names = contingents.map((row) => row.name.trim().toLocaleLowerCase("id"));
  if (new Set(names).size !== names.length) throw new Error("Nama kontingen tidak boleh sama.");
  for (const row of contingents) {
    await sql`
      insert into contingents (id, name, logo, gold, silver, bronze, updated_at)
      values (${row.id}, ${row.name}, ${row.logo}, ${row.gold}, ${row.silver}, ${row.bronze}, now())
      on conflict (id) do update set
        name = excluded.name,
        logo = excluded.logo,
        gold = excluded.gold,
        silver = excluded.silver,
        bronze = excluded.bronze,
        updated_at = now()
    `;
  }
  const existing = await sql<{ id: string }>`select id from contingents`;
  const keep = new Set(ids);
  for (const row of existing) {
    if (!keep.has(row.id)) await sql`delete from contingents where id = ${row.id}`;
  }
}

export const getBoard = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    if (input == null) return { t: 0 };
    return z.object({ t: z.number().optional() }).parse(input);
  })
  .handler(async () => {
    const sql = await getSql();
    return readBoard(sql);
  });

export const verifyPin = createServerFn({ method: "POST" })
  .validator((input: unknown) => parseInput(pinSchema, input))
  .handler(async ({ data }) => {
    await requirePin(data.pin);
    return { ok: true as const };
  });

export const saveBoard = createServerFn({ method: "POST" })
  .validator((input: unknown) => parseInput(saveSchema, input))
  .handler(async ({ data }) => {
    const sql = await requirePin(data.pin);
    const settings = data.settings;
    await sql`
      update board_meta set
        title = ${settings.title},
        subtitle = ${settings.subtitle},
        tagline = ${settings.tagline},
        event_note = ${settings.eventNote},
        logo1 = ${settings.logo1},
        logo2 = ${settings.logo2},
        logo3 = ${settings.logo3},
        background = ${settings.background},
        color_navy = ${settings.colorNavy},
        color_gold = ${settings.colorGold},
        color_accent = ${settings.colorAccent},
        color_paper = ${settings.colorPaper},
        seeded = true,
        updated_at = now()
      where id = 1
    `;
    await writeTeams(sql, data.contingents);
    return readBoard(sql);
  });

export const changePin = createServerFn({ method: "POST" })
  .validator((input: unknown) => parseInput(changePinSchema, input))
  .handler(async ({ data }) => {
    const sql = await requirePin(data.pin);
    await sql`update board_meta set pin = ${data.nextPin}, updated_at = now() where id = 1`;
    return { ok: true as const, pinIsDefault: data.nextPin === DEFAULT_PIN };
  });

export const resetBoard = createServerFn({ method: "POST" })
  .validator((input: unknown) => parseInput(pinSchema, input))
  .handler(async ({ data }) => {
    const sql = await requirePin(data.pin);
    const copy = DEFAULT_COPY;
    await sql`
      update board_meta set
        title = ${copy.title},
        subtitle = ${copy.subtitle},
        tagline = ${copy.tagline},
        event_note = ${copy.eventNote},
        logo1 = '',
        logo2 = '',
        logo3 = '',
        background = '',
        color_navy = ${copy.colorNavy},
        color_gold = ${copy.colorGold},
        color_accent = ${copy.colorAccent},
        color_paper = ${copy.colorPaper},
        seeded = true,
        updated_at = now()
      where id = 1
    `;
    await writeTeams(
      sql,
      SEED_SCHOOLS.map((school) => ({
        id: school.id,
        name: school.name,
        logo: "",
        gold: 0,
        silver: 0,
        bronze: 0,
      })),
    );
    return readBoard(sql);
  });
