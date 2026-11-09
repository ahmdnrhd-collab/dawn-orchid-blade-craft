//#region node_modules/.nitro/vite/services/ssr/assets/model-CIMqvaBA.js
var DEFAULT_PIN = "benjeng2026";
var DEFAULT_COPY = {
	title: "LIVE MEDAL STANDING",
	subtitle: "POR (PEKAN OLAHRAGA) SD KECAMATAN BENJENG 2026",
	tagline: "SPORTIVITAS • SOLIDARITAS • PRESTASI",
	eventNote: "Kecamatan Benjeng · Kabupaten Gresik",
	colorNavy: "#0c1b33",
	colorGold: "#e3b341",
	colorAccent: "#e23d3d",
	colorPaper: "#f6f3ec"
};
function buildSeed() {
	const rows = [];
	for (let n = 93; n <= 117; n += 1) rows.push({
		id: `sdn-${n}`,
		name: `UPT SD Negeri ${n} Gresik`
	});
	rows.push({
		id: "sd-muhammadiyah",
		name: "SD Muhammadiyah Benjeng"
	}, {
		id: "sd-maarif",
		name: "SD Ma'arif NU 45"
	}, {
		id: "sd-nu-munggugebang",
		name: "SD NU Munggugebang"
	});
	return rows;
}
var SEED_SCHOOLS = buildSeed();
function newId() {
	return `c-${Math.random().toString(36).slice(2, 10)}`;
}
function normName(name) {
	return name.trim().toLocaleLowerCase("id").replaceAll("’", "'").replaceAll("`", "'").replace(/\s+/g, " ");
}
function monogram(name) {
	const negeri = name.match(/negeri\s+(\d+)/i);
	if (negeri) return negeri[1];
	if (/muhammadiyah/i.test(name)) return "MB";
	if (/ma.?arif/i.test(name)) return "MN";
	if (/munggugebang/i.test(name)) return "NU";
	return name.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter((word) => word && ![
		"SD",
		"UPT",
		"NU",
		"DAN"
	].includes(word.toUpperCase())).map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "SD";
}
function clampMedal(value) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(999, Math.trunc(value)));
}
function rankContingents(rows) {
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
			rank: ahead + 1
		};
	});
}
function totals(rows) {
	let gold = 0;
	let silver = 0;
	let bronze = 0;
	for (const row of rows) {
		gold += row.gold;
		silver += row.silver;
		bronze += row.bronze;
	}
	return {
		gold,
		silver,
		bronze,
		all: gold + silver + bronze,
		teams: rows.length
	};
}
function latestStamp(board) {
	let max = board.settings.updatedAt;
	for (const row of board.contingents) if (row.updatedAt > max) max = row.updatedAt;
	return max || (/* @__PURE__ */ new Date()).toISOString();
}
function formatWib(iso) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "—";
	return `${new Intl.DateTimeFormat("id-ID", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
		timeZone: "Asia/Jakarta"
	}).format(date)} WIB`;
}
function viewKey(board) {
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
			colorPaper: board.settings.colorPaper
		},
		rows: board.contingents.map((row) => [
			row.id,
			row.name,
			row.logo,
			row.gold,
			row.silver,
			row.bronze
		])
	});
}
function toSettingsInput(settings) {
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
		colorPaper: settings.colorPaper
	};
}
function toContingentInput(row) {
	return {
		id: row.id,
		name: row.name,
		logo: row.logo,
		gold: row.gold,
		silver: row.silver,
		bronze: row.bronze
	};
}
function medalDeltas(prev, next) {
	const prevMap = new Map(prev.map((row) => [row.id, row]));
	const nextMap = new Map(next.map((row) => [row.id, row]));
	const lines = [];
	const ids = [];
	for (const row of next) {
		const before = prevMap.get(row.id);
		if (!before) {
			lines.push(`${row.name} masuk klasemen`);
			ids.push(row.id);
			continue;
		}
		const bits = [];
		const push = (delta, label) => {
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
	for (const row of prev) if (!nextMap.has(row.id)) lines.push(`${row.name} keluar klasemen`);
	let text = "";
	if (lines.length === 1) text = lines[0];
	else if (lines.length === 2) text = `${lines[0]} · ${lines[1]}`;
	else if (lines.length > 2) text = `${lines[0]} · ${lines[1]} · +${lines.length - 2} lainnya`;
	return {
		text,
		ids
	};
}
function rankMoves(prev, next) {
	const before = new Map(rankContingents(prev).map((row) => [row.id, row.rank]));
	const moves = {};
	for (const row of rankContingents(next)) {
		const oldRank = before.get(row.id);
		if (oldRank != null && oldRank !== row.rank) moves[row.id] = oldRank - row.rank;
	}
	return moves;
}
function errorText(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "object" && error && "message" in error) {
		const message = error.message;
		if (typeof message === "string" && message) return message;
	}
	return "Terjadi kendala. Coba lagi.";
}
function csvCell(value) {
	const text = String(value);
	if (/[;"\n]/.test(text)) return `"${text.replaceAll("\"", "\"\"")}"`;
	return text;
}
function toCsv(rows) {
	return `\uFEFFid;nama;emas;perak;perunggu\n${[...rows].sort((a, b) => a.name.localeCompare(b.name, "id")).map((row) => [
		row.id,
		row.name,
		row.gold,
		row.silver,
		row.bronze
	].map(csvCell).join(";")).join("\n")}\n`;
}
function splitCsvLine(line, delim) {
	const cells = [];
	let current = "";
	let quoted = false;
	for (let i = 0; i < line.length; i += 1) {
		const char = line[i];
		if (quoted) {
			if (char === "\"") {
				if (line[i + 1] === "\"") {
					current += "\"";
					i += 1;
				} else quoted = false;
			} else current += char;
		} else if (char === "\"") quoted = true;
		else if (char === delim) {
			cells.push(current);
			current = "";
		} else current += char;
	}
	cells.push(current);
	return cells;
}
function parseCsv(text) {
	const raw = text.replace(/^\uFEFF/, "").trim();
	if (!raw) throw new Error("File kosong.");
	const lines = raw.split(/\r?\n/).filter((line) => line.trim());
	const delim = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ";" : ",";
	const head = splitCsvLine(lines[0], delim).map((cell) => cell.trim().toLowerCase());
	const known = [
		"id",
		"nama",
		"name",
		"kontingen",
		"emas",
		"gold",
		"perak",
		"silver",
		"perunggu",
		"bronze"
	];
	const hasHeader = head.some((cell) => known.includes(cell));
	const find = (aliases) => head.findIndex((cell) => aliases.includes(cell));
	let idI = -1;
	let nameI = 0;
	let goldI = 1;
	let silverI = 2;
	let bronzeI = 3;
	if (hasHeader) {
		idI = find(["id"]);
		nameI = find([
			"nama",
			"name",
			"kontingen"
		]);
		goldI = find(["emas", "gold"]);
		silverI = find(["perak", "silver"]);
		bronzeI = find(["perunggu", "bronze"]);
		if (nameI < 0 || goldI < 0 || silverI < 0 || bronzeI < 0) throw new Error("Kolom wajib: nama, emas, perak, perunggu.");
	}
	const body = hasHeader ? lines.slice(1) : lines;
	if (!body.length) throw new Error("Tidak ada baris data.");
	if (body.length > 80) throw new Error("Maksimal 80 kontingen.");
	return body.map((line, index) => {
		const cols = splitCsvLine(line, delim);
		const name = (cols[nameI] ?? "").trim();
		if (!name) throw new Error(`Baris ${index + 1}: nama kosong.`);
		const medal = (at, label) => {
			const cell = (cols[at] ?? "").trim();
			if (!cell) return 0;
			const value = Number(cell.replace(",", "."));
			if (!Number.isInteger(value) || value < 0 || value > 999) throw new Error(`Baris ${index + 1}: ${label} harus bilangan 0–999.`);
			return value;
		};
		const rawId = idI >= 0 ? (cols[idI] ?? "").trim() : "";
		return {
			id: /^[a-z0-9-]{1,40}$/.test(rawId) ? rawId : void 0,
			name,
			gold: medal(goldI, "emas"),
			silver: medal(silverI, "perak"),
			bronze: medal(bronzeI, "perunggu")
		};
	});
}
function applyImport(current, rows) {
	const byId = new Map(current.map((row) => [row.id, row]));
	const byName = new Map(current.map((row) => [normName(row.name), row]));
	const used = /* @__PURE__ */ new Set();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return rows.map((row) => {
		const idMatch = row.id ? byId.get(row.id) : void 0;
		const nameMatch = byName.get(normName(row.name));
		const match = idMatch && !used.has(idMatch.id) ? idMatch : nameMatch && !used.has(nameMatch.id) ? nameMatch : void 0;
		if (match) {
			used.add(match.id);
			return {
				...match,
				name: row.name.trim(),
				gold: row.gold,
				silver: row.silver,
				bronze: row.bronze
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
			updatedAt: now
		};
	});
}
function downloadText(filename, contents, type) {
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
//#endregion
export { toContingentInput as _, clampMedal as a, totals as b, formatWib as c, monogram as d, newId as f, rankMoves as g, rankContingents as h, applyImport as i, latestStamp as l, parseCsv as m, DEFAULT_PIN as n, downloadText as o, normName as p, SEED_SCHOOLS as r, errorText as s, DEFAULT_COPY as t, medalDeltas as u, toCsv as v, viewKey as x, toSettingsInput as y };
