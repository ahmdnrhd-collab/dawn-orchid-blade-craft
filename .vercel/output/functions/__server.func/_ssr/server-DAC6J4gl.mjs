import { n as DEFAULT_PIN, r as SEED_SCHOOLS, t as DEFAULT_COPY } from "./model-CIMqvaBA.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, r as number, t as array } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-DAC6J4gl.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var _0002_medal_default = "create table if not exists board_meta (\n  id smallint primary key default 1,\n  title text not null,\n  subtitle text not null,\n  tagline text not null,\n  event_note text not null default '',\n  logo1 text not null default '',\n  logo2 text not null default '',\n  logo3 text not null default '',\n  background text not null default '',\n  color_navy text not null default '#0c1b33',\n  color_gold text not null default '#e3b341',\n  color_accent text not null default '#e23d3d',\n  color_paper text not null default '#f6f3ec',\n  pin text not null default 'benjeng2026',\n  seeded boolean not null default false,\n  updated_at timestamptz not null default now(),\n  constraint board_meta_singleton check (id = 1)\n);\n\ninsert into board_meta (id, title, subtitle, tagline, event_note)\nvalues (\n  1,\n  'LIVE MEDAL STANDING',\n  'POR (PEKAN OLAHRAGA) SD KECAMATAN BENJENG 2026',\n  'SPORTIVITAS • SOLIDARITAS • PRESTASI',\n  'Kecamatan Benjeng · Kabupaten Gresik'\n)\non conflict (id) do nothing;\n\ncreate table if not exists contingents (\n  id text primary key,\n  name text not null,\n  logo text not null default '',\n  gold integer not null default 0,\n  silver integer not null default 0,\n  bronze integer not null default 0,\n  updated_at timestamptz not null default now(),\n  constraint contingents_gold_range check (gold >= 0 and gold <= 999),\n  constraint contingents_silver_range check (silver >= 0 and silver <= 999),\n  constraint contingents_bronze_range check (bronze >= 0 and bronze <= 999)\n);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_medal.sql": _0002_medal_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var imagePattern = /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=\s]+$/i;
var imageField = (max, label) => string().max(max, `${label} terlalu besar.`).refine((value) => value === "" || imagePattern.test(value), `${label} harus berupa gambar.`);
var settingsSchema = object({
	title: string().trim().min(1, "Judul wajib diisi.").max(80, "Judul terlalu panjang."),
	subtitle: string().trim().min(1, "Subjudul wajib diisi.").max(160, "Subjudul terlalu panjang."),
	tagline: string().trim().min(1, "Tulisan tambahan wajib diisi.").max(120, "Tulisan tambahan terlalu panjang."),
	eventNote: string().trim().max(280, "Informasi acara terlalu panjang."),
	logo1: imageField(12e4, "Logo penyelenggara"),
	logo2: imageField(12e4, "Logo penyelenggara"),
	logo3: imageField(12e4, "Logo penyelenggara"),
	background: imageField(28e4, "Latar"),
	colorNavy: string().regex(/^#[0-9a-fA-F]{6}$/, "Warna latar tidak valid."),
	colorGold: string().regex(/^#[0-9a-fA-F]{6}$/, "Warna emas tidak valid."),
	colorAccent: string().regex(/^#[0-9a-fA-F]{6}$/, "Warna aksen tidak valid."),
	colorPaper: string().regex(/^#[0-9a-fA-F]{6}$/, "Warna teks tidak valid.")
});
var contingentSchema = object({
	id: string().regex(/^[a-z0-9-]{1,40}$/, "Identitas kontingen tidak valid."),
	name: string().trim().min(1, "Nama kontingen wajib diisi.").max(80, "Nama kontingen terlalu panjang."),
	logo: imageField(8e4, "Logo kontingen"),
	gold: number().int().min(0).max(999),
	silver: number().int().min(0).max(999),
	bronze: number().int().min(0).max(999)
});
var saveSchema = object({
	pin: string().min(4, "PIN minimal 4 karakter.").max(40),
	settings: settingsSchema,
	contingents: array(contingentSchema).max(80, "Maksimal 80 kontingen.")
});
var pinSchema = object({ pin: string().min(4, "PIN minimal 4 karakter.").max(40) });
var changePinSchema = object({
	pin: string().min(4).max(40),
	nextPin: string().min(4, "PIN baru minimal 4 karakter.").max(40, "PIN baru terlalu panjang.")
});
function parseInput(schema, input) {
	const result = schema.safeParse(input);
	if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Data tidak valid.");
	return result.data;
}
function asIso(value) {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string" && value) {
		const date = new Date(value);
		if (!Number.isNaN(date.getTime())) return date.toISOString();
	}
	return (/* @__PURE__ */ new Date()).toISOString();
}
function asInt(value) {
	const number = typeof value === "number" ? value : Number(value);
	return Number.isFinite(number) ? Math.trunc(number) : 0;
}
function asBool(value) {
	return value === true || value === "t" || value === "true" || value === 1;
}
function asText(value) {
	return typeof value === "string" ? value : value == null ? "" : String(value);
}
function pinMatches(input, stored) {
	const left = input.normalize("NFKC");
	const right = stored.normalize("NFKC");
	let diff = left.length ^ right.length;
	const length = Math.max(left.length, right.length);
	for (let i = 0; i < length; i += 1) diff |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
	return diff === 0 && left.length > 0;
}
async function readBoard(sql, seeding = false) {
	const meta = (await sql`
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
  `)[0];
	if (!meta) throw new Error("Data klasemen belum siap.");
	if (!asBool(meta.seeded)) {
		if (seeding) throw new Error("Data awal gagal disiapkan.");
		for (const school of SEED_SCHOOLS) await sql`
        insert into contingents (id, name, logo, gold, silver, bronze)
        values (${school.id}, ${school.name}, '', 0, 0, 0)
        on conflict (id) do nothing
      `;
		await sql`update board_meta set seeded = true, updated_at = now() where id = 1`;
		return readBoard(sql, true);
	}
	const teamRows = await sql`
    select id, name, logo, gold, silver, bronze, updated_at
    from contingents
  `;
	return {
		settings: {
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
			updatedAt: asIso(meta.updated_at)
		},
		contingents: teamRows.map((row) => ({
			id: asText(row.id),
			name: asText(row.name),
			logo: asText(row.logo),
			gold: asInt(row.gold),
			silver: asInt(row.silver),
			bronze: asInt(row.bronze),
			updatedAt: asIso(row.updated_at)
		}))
	};
}
async function requirePin(pin) {
	const sql = await getSql();
	if (!pinMatches(pin, (await sql`select pin from board_meta where id = 1`)[0]?.pin ?? "")) throw new Error("PIN salah.");
	return sql;
}
async function writeTeams(sql, contingents) {
	const ids = contingents.map((row) => row.id);
	if (new Set(ids).size !== ids.length) throw new Error("Ada kontingen dengan identitas ganda.");
	const names = contingents.map((row) => row.name.trim().toLocaleLowerCase("id"));
	if (new Set(names).size !== names.length) throw new Error("Nama kontingen tidak boleh sama.");
	for (const row of contingents) await sql`
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
	const existing = await sql`select id from contingents`;
	const keep = new Set(ids);
	for (const row of existing) if (!keep.has(row.id)) await sql`delete from contingents where id = ${row.id}`;
}
var getBoard_createServerFn_handler = createServerRpc({
	id: "e01f557acd51904191c09c995236be380c06403046749e5551eaea30ce729878",
	name: "getBoard",
	filename: "src/lib/medal/server.ts"
}, (opts) => getBoard.__executeServer(opts));
var getBoard = createServerFn({ method: "GET" }).validator((input) => {
	if (input == null) return { t: 0 };
	return object({ t: number().optional() }).parse(input);
}).handler(getBoard_createServerFn_handler, async () => {
	return readBoard(await getSql());
});
var verifyPin_createServerFn_handler = createServerRpc({
	id: "58865f9ed47030f7c85975593554f6a0e4582f23dc497120b409c7c87015572a",
	name: "verifyPin",
	filename: "src/lib/medal/server.ts"
}, (opts) => verifyPin.__executeServer(opts));
var verifyPin = createServerFn({ method: "POST" }).validator((input) => parseInput(pinSchema, input)).handler(verifyPin_createServerFn_handler, async ({ data }) => {
	await requirePin(data.pin);
	return { ok: true };
});
var saveBoard_createServerFn_handler = createServerRpc({
	id: "fb40577c611625e8da321d780caa9ac306ae336e40272e6dc795d41c9b0eb5a0",
	name: "saveBoard",
	filename: "src/lib/medal/server.ts"
}, (opts) => saveBoard.__executeServer(opts));
var saveBoard = createServerFn({ method: "POST" }).validator((input) => parseInput(saveSchema, input)).handler(saveBoard_createServerFn_handler, async ({ data }) => {
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
var changePin_createServerFn_handler = createServerRpc({
	id: "a918bfc4eb1750921aa90cf65e99f4e8464285b9d84d65be2a1a40d6c5f2541d",
	name: "changePin",
	filename: "src/lib/medal/server.ts"
}, (opts) => changePin.__executeServer(opts));
var changePin = createServerFn({ method: "POST" }).validator((input) => parseInput(changePinSchema, input)).handler(changePin_createServerFn_handler, async ({ data }) => {
	await (await requirePin(data.pin))`update board_meta set pin = ${data.nextPin}, updated_at = now() where id = 1`;
	return {
		ok: true,
		pinIsDefault: data.nextPin === DEFAULT_PIN
	};
});
var resetBoard_createServerFn_handler = createServerRpc({
	id: "5ca73adab3058e7f0186b45d384f7ae11a9f1748d15522e66d6a5aee3079424c",
	name: "resetBoard",
	filename: "src/lib/medal/server.ts"
}, (opts) => resetBoard.__executeServer(opts));
var resetBoard = createServerFn({ method: "POST" }).validator((input) => parseInput(pinSchema, input)).handler(resetBoard_createServerFn_handler, async ({ data }) => {
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
	await writeTeams(sql, SEED_SCHOOLS.map((school) => ({
		id: school.id,
		name: school.name,
		logo: "",
		gold: 0,
		silver: 0,
		bronze: 0
	})));
	return readBoard(sql);
});
//#endregion
export { changePin_createServerFn_handler, getBoard_createServerFn_handler, resetBoard_createServerFn_handler, saveBoard_createServerFn_handler, verifyPin_createServerFn_handler };
