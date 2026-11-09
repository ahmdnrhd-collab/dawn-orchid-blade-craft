export const DEFAULT_PIN = "benjeng2026";

export const DEFAULT_COPY = {
  title: "LIVE MEDAL STANDING",
  subtitle: "POR (PEKAN OLAHRAGA) SD KECAMATAN BENJENG 2026",
  tagline: "SPORTIVITAS • SOLIDARITAS • PRESTASI",
  eventNote: "Kecamatan Benjeng · Kabupaten Gresik",
  colorNavy: "#0c1b33",
  colorGold: "#e3b341",
  colorAccent: "#e23d3d",
  colorPaper: "#f6f3ec",
} as const;

export type Settings = {
  title: string;
  subtitle: string;
  tagline: string;
  eventNote: string;
  logo1: string;
  logo2: string;
  logo3: string;
  background: string;
  colorNavy: string;
  colorGold: string;
  colorAccent: string;
  colorPaper: string;
  pinIsDefault: boolean;
  updatedAt: string;
};

export type SettingsInput = {
  title: string;
  subtitle: string;
  tagline: string;
  eventNote: string;
  logo1: string;
  logo2: string;
  logo3: string;
  background: string;
  colorNavy: string;
  colorGold: string;
  colorAccent: string;
  colorPaper: string;
};

export type Contingent = {
  id: string;
  name: string;
  logo: string;
  gold: number;
  silver: number;
  bronze: number;
  updatedAt: string;
};

export type ContingentInput = {
  id: string;
  name: string;
  logo: string;
  gold: number;
  silver: number;
  bronze: number;
};

export type RankedContingent = Contingent & { rank: number; total: number };

export type Board = {
  settings: Settings;
  contingents: Contingent[];
};

export type CsvRow = {
  id?: string;
  name: string;
  gold: number;
  silver: number;
  bronze: number;
};

function buildSeed(): { id: string; name: string }[] {
  const rows: { id: string; name: string }[] = [];
  for (let n = 93; n <= 117; n += 1) {
    rows.push({ id: `sdn-${n}`, name: `UPT SD Negeri ${n} Gresik` });
  }
  rows.push(
    { id: "sd-muhammadiyah", name: "SD Muhammadiyah Benjeng" },
    { id: "sd-maarif", name: "SD Ma'arif NU 45" },
    { id: "sd-nu-munggugebang", name: "SD NU Munggugebang" },
  );
  return rows;
}

export const SEED_SCHOOLS = buildSeed();

export function newId() {
  return `c-${Math.random().toString(36).slice(2, 10)}`;
}

export function normName(name: string) {
  return name
    .trim()
    .toLocaleLowerCase("id")
    .replaceAll("’", "'")
    .replaceAll("`", "'")
    .replace(/\s+/g, " ");
}

export function monogram(name: string) {
  const negeri = name.match(/negeri\s+(\d+)/i);
  if (negeri) return negeri[1];
  if (/muhammadiyah/i.test(name)) return "MB";
  if (/ma.?arif/i.test(name)) return "MN";
  if (/munggugebang/i.test(name)) return "NU";
  const words = name
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(/\s+/)
    .filter((word) => word && !["SD", "UPT", "NU", "DAN"].includes(word.toUpperCase()));
  return words.map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "SD";
}

export function clampMedal(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(999, Math.trunc(value)));
}

export function rankContingents(rows: Contingent[]): RankedContingent[] {
  const sorted = [...rows].sort((a, b) => {
    if (b.gold !== a.gold) return b.gold - a.gold;
    if (b.silver !== a.silver) return b.silver - a.silver;
    if (b.bronze !== a.bronze) return b.bronze - a.bronze;
    const byName = a.name.localeCompare(b.name, "id", { sensitivity: "base" });
    if (byName !== 0) return byName;
    return a.id.localeCompare(b.id);
  });
  return sorted.map((row) => {
    let ahead = 0;
    for (const other of sorted) if (other.gold > row.gold) ahead += 1;
    return {
      ...row,
      total: row.gold + row.silver + row.bronze,
      rank: ahead + 1,
    };
  });
}

export function totals(rows: { gold: number; silver: number; bronze: number }[]) {
  let gold = 0;
  let silver = 0;
  let bronze = 0;
  for (const row of rows) {
    gold += row.gold;
    silver += row.silver;
    bronze += row.bronze;
  }
  return { gold, silver, bronze, all: gold + silver + bronze, teams: rows.length };
}

export function latestStamp(board: Board) {
  let max = board.settings.updatedAt;
  for (const row of board.contingents) {
    if (row.updatedAt > max) max = row.updatedAt;
  }
  return max || new Date().toISOString();
}

export function formatWib(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const text = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
  return `${text} WIB`;
}

export function viewKey(board: Board) {
  return JSON.stringify({
    settings: {
      title: board.settings.title,
      subtitle: board.settings.subtitle,
      tagline: board.settings.tagline,
      eventNote: board.settings.eventNote,
      logo1: board.settings.logo1,
      logo2: board.settings.logo2,
      logo3: board.settings.logo3,
      background: board.settings.background,
      colorNavy: board.settings.colorNavy,
      colorGold: board.settings.colorGold,
      colorAccent: board.settings.colorAccent,
      colorPaper: board.settings.colorPaper,
    },
    rows: board.contingents.map((row) => [
      row.id,
      row.name,
      row.logo,
      row.gold,
      row.silver,
      row.bronze,
    ]),
  });
}

export function toSettingsInput(settings: Settings): SettingsInput {
  return {
    title: settings.title,
    subtitle: settings.subtitle,
    tagline: settings.tagline,
    eventNote: settings.eventNote,
    logo1: settings.logo1,
    logo2: settings.logo2,
    logo3: settings.logo3,
    background: settings.background,
    colorNavy: settings.colorNavy,
    colorGold: settings.colorGold,
    colorAccent: settings.colorAccent,
    colorPaper: settings.colorPaper,
  };
}

export function toContingentInput(row: Contingent): ContingentInput {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo,
    gold: row.gold,
    silver: row.silver,
    bronze: row.bronze,
  };
}

export function medalDeltas(prev: Contingent[], next: Contingent[]) {
  const prevMap = new Map(prev.map((row) => [row.id, row]));
  const nextMap = new Map(next.map((row) => [row.id, row]));
  const lines: string[] = [];
  const ids: string[] = [];
  for (const row of next) {
    const before = prevMap.get(row.id);
    if (!before) {
      lines.push(`${row.name} masuk klasemen`);
      ids.push(row.id);
      continue;
    }
    const bits: string[] = [];
    const push = (delta: number, label: string) => {
      if (delta > 0) bits.push(`+${delta} ${label}`);
      else if (delta < 0) bits.push(`${delta} ${label}`);
    };
    push(row.gold - before.gold, "emas");
    push(row.silver - before.silver, "perak");
    push(row.bronze - before.bronze, "perunggu");
    if (bits.length) {
      lines.push(`${row.name} ${bits.join(", ")}`);
      ids.push(row.id);
    }
  }
  for (const row of prev) {
    if (!nextMap.has(row.id)) lines.push(`${row.name} keluar klasemen`);
  }
  let text = "";
  if (lines.length === 1) text = lines[0];
  else if (lines.length === 2) text = `${lines[0]} · ${lines[1]}`;
  else if (lines.length > 2) text = `${lines[0]} · ${lines[1]} · +${lines.length - 2} lainnya`;
  return { text, ids };
}

export function rankMoves(prev: Contingent[], next: Contingent[]) {
  const before = new Map(rankContingents(prev).map((row) => [row.id, row.rank]));
  const moves: Record<string, number> = {};
  for (const row of rankContingents(next)) {
    const oldRank = before.get(row.id);
    if (oldRank != null && oldRank !== row.rank) moves[row.id] = oldRank - row.rank;
  }
  return moves;
}

export function errorText(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return "Terjadi kendala. Coba lagi.";
}

function csvCell(value: string | number) {
  const text = String(value);
  if (/[;"\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function toCsv(rows: Contingent[]) {
  const header = "id;nama;emas;perak;perunggu";
  const lines = [...rows]
    .sort((a, b) => a.name.localeCompare(b.name, "id"))
    .map((row) => [row.id, row.name, row.gold, row.silver, row.bronze].map(csvCell).join(";"));
  return `\uFEFF${header}\n${lines.join("\n")}\n`;
}

function splitCsvLine(line: string, delim: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quoted) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else quoted = false;
      } else current += char;
    } else if (char === '"') quoted = true;
    else if (char === delim) {
      cells.push(current);
      current = "";
    } else current += char;
  }
  cells.push(current);
  return cells;
}

export function parseCsv(text: string): CsvRow[] {
  const raw = text.replace(/^\uFEFF/, "").trim();
  if (!raw) throw new Error("File kosong.");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim());
  const delim = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ";" : ",";
  const head = splitCsvLine(lines[0], delim).map((cell) => cell.trim().toLowerCase());
  const known = ["id", "nama", "name", "kontingen", "emas", "gold", "perak", "silver", "perunggu", "bronze"];
  const hasHeader = head.some((cell) => known.includes(cell));
  const find = (aliases: string[]) => head.findIndex((cell) => aliases.includes(cell));
  let idI = -1;
  let nameI = 0;
  let goldI = 1;
  let silverI = 2;
  let bronzeI = 3;
  if (hasHeader) {
    idI = find(["id"]);
    nameI = find(["nama", "name", "kontingen"]);
    goldI = find(["emas", "gold"]);
    silverI = find(["perak", "silver"]);
    bronzeI = find(["perunggu", "bronze"]);
    if (nameI < 0 || goldI < 0 || silverI < 0 || bronzeI < 0) {
      throw new Error("Kolom wajib: nama, emas, perak, perunggu.");
    }
  }
  const body = hasHeader ? lines.slice(1) : lines;
  if (!body.length) throw new Error("Tidak ada baris data.");
  if (body.length > 80) throw new Error("Maksimal 80 kontingen.");
  return body.map((line, index) => {
    const cols = splitCsvLine(line, delim);
    const name = (cols[nameI] ?? "").trim();
    if (!name) throw new Error(`Baris ${index + 1}: nama kosong.`);
    const medal = (at: number, label: string) => {
      const cell = (cols[at] ?? "").trim();
      if (!cell) return 0;
      const value = Number(cell.replace(",", "."));
      if (!Number.isInteger(value) || value < 0 || value > 999) {
        throw new Error(`Baris ${index + 1}: ${label} harus bilangan 0–999.`);
      }
      return value;
    };
    const rawId = idI >= 0 ? (cols[idI] ?? "").trim() : "";
    const id = /^[a-z0-9-]{1,40}$/.test(rawId) ? rawId : undefined;
    return {
      id,
      name,
      gold: medal(goldI, "emas"),
      silver: medal(silverI, "perak"),
      bronze: medal(bronzeI, "perunggu"),
    };
  });
}

export function applyImport(current: Contingent[], rows: CsvRow[]): Contingent[] {
  const byId = new Map(current.map((row) => [row.id, row]));
  const byName = new Map(current.map((row) => [normName(row.name), row]));
  const used = new Set<string>();
  const now = new Date().toISOString();
  return rows.map((row) => {
    const idMatch = row.id ? byId.get(row.id) : undefined;
    const nameMatch = byName.get(normName(row.name));
    const match =
      idMatch && !used.has(idMatch.id)
        ? idMatch
        : nameMatch && !used.has(nameMatch.id)
          ? nameMatch
          : undefined;
    if (match) {
      used.add(match.id);
      return {
        ...match,
        name: row.name.trim(),
        gold: row.gold,
        silver: row.silver,
        bronze: row.bronze,
      };
    }
    let id = newId();
    while (byId.has(id) || used.has(id)) id = newId();
    used.add(id);
    return {
      id,
      name: row.name.trim(),
      logo: "",
      gold: row.gold,
      silver: row.silver,
      bronze: row.bronze,
      updatedAt: now,
    };
  });
}

export function downloadText(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
