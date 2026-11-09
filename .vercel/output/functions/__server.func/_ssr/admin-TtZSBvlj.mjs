import { o as __toESM } from "../_runtime.mjs";
import { _ as toContingentInput, a as clampMedal, b as totals, c as formatWib, f as newId, h as rankContingents, i as applyImport, l as latestStamp, m as parseCsv, n as DEFAULT_PIN, o as downloadText, p as normName, s as errorText, t as DEFAULT_COPY, v as toCsv, x as viewKey, y as toSettingsInput } from "./model-CIMqvaBA.mjs";
import { S as require_jsx_runtime, Y as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Save, c as Plus, h as Download, i as Trash2, l as Minus, m as ImagePlus, o as RotateCcw, p as LogOut, t as Upload } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as verifyPin, i as changePin, n as Route, o as resetBoard, s as saveBoard } from "./router-DMXjnYOl.mjs";
import { n as TeamMark } from "./marks-DCKPQSFT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-TtZSBvlj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function drawToJpeg(file, maxEdge, quality) {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const image = new Image();
		image.onload = () => {
			const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
			const width = Math.max(1, Math.round(image.width * scale));
			const height = Math.max(1, Math.round(image.height * scale));
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const context = canvas.getContext("2d");
			if (!context) {
				URL.revokeObjectURL(url);
				reject(/* @__PURE__ */ new Error("Gambar tidak bisa diproses."));
				return;
			}
			context.fillStyle = "#ffffff";
			context.fillRect(0, 0, width, height);
			context.drawImage(image, 0, 0, width, height);
			URL.revokeObjectURL(url);
			resolve(canvas.toDataURL("image/jpeg", quality));
		};
		image.onerror = () => {
			URL.revokeObjectURL(url);
			reject(/* @__PURE__ */ new Error("Gambar tidak terbaca. Gunakan JPG, PNG, atau WebP."));
		};
		image.src = url;
	});
}
async function compressImage(file, maxEdge, quality, limit) {
	if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar.");
	const first = await drawToJpeg(file, maxEdge, quality);
	if (first.length <= limit) return first;
	const second = await drawToJpeg(file, Math.round(maxEdge * .72), Math.max(.55, quality - .18));
	if (second.length <= limit) return second;
	throw new Error("Gambar masih terlalu besar. Pilih file yang lebih ringan.");
}
var PIN_KEY = "por-benjeng-admin-pin";
var TABS = [
	{
		id: "medali",
		label: "Medali"
	},
	{
		id: "kontingen",
		label: "Kontingen"
	},
	{
		id: "header",
		label: "Header"
	},
	{
		id: "tampilan",
		label: "Tampilan"
	},
	{
		id: "data",
		label: "Data"
	}
];
function AdminDashboard({ initial }) {
	const [gate, setGate] = (0, import_react.useState)("checking");
	const [pin, setPin] = (0, import_react.useState)("");
	const [draftPin, setDraftPin] = (0, import_react.useState)("");
	const [showPin, setShowPin] = (0, import_react.useState)(false);
	const [loginError, setLoginError] = (0, import_react.useState)("");
	const [busyLogin, setBusyLogin] = (0, import_react.useState)(false);
	const [board, setBoard] = (0, import_react.useState)(initial);
	const [saved, setSaved] = (0, import_react.useState)(initial);
	const [tab, setTab] = (0, import_react.useState)("medali");
	const [status, setStatus] = (0, import_react.useState)("saved");
	const [error, setError] = (0, import_react.useState)("");
	const [query, setQuery] = (0, import_react.useState)("");
	const [sortMode, setSortMode] = (0, import_react.useState)("rank");
	const [newName, setNewName] = (0, import_react.useState)("");
	const [nextPin, setNextPin] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	const confirmRun = (0, import_react.useRef)(null);
	const latest = (0, import_react.useRef)(initial);
	const savedRef = (0, import_react.useRef)(initial);
	const pinRef = (0, import_react.useRef)("");
	const running = (0, import_react.useRef)(false);
	const statusOk = (0, import_react.useRef)(true);
	const debounce = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		pinRef.current = pin;
	}, [pin]);
	(0, import_react.useEffect)(() => {
		const stored = sessionStorage.getItem(PIN_KEY);
		if (!stored) {
			setGate("out");
			return;
		}
		verifyPin({ data: { pin: stored } }).then(() => {
			pinRef.current = stored;
			setPin(stored);
			setGate("in");
		}).catch(() => {
			sessionStorage.removeItem(PIN_KEY);
			setGate("out");
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (!confirm) return;
		const onKey = (event) => {
			if (event.key === "Escape") setConfirm(null);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [confirm]);
	async function drain() {
		if (!pinRef.current) return;
		if (running.current) return;
		running.current = true;
		statusOk.current = true;
		setStatus("saving");
		try {
			while (viewKey(latest.current) !== viewKey(savedRef.current)) {
				const snap = latest.current;
				const result = await saveBoard({ data: {
					pin: pinRef.current,
					settings: toSettingsInput(snap.settings),
					contingents: snap.contingents.map(toContingentInput)
				} });
				savedRef.current = result;
				setSaved(result);
				if (viewKey(latest.current) === viewKey(snap)) {
					latest.current = result;
					setBoard(result);
				}
			}
			setStatus("saved");
			setError("");
		} catch (reason) {
			statusOk.current = false;
			setStatus("error");
			setError(errorText(reason));
		} finally {
			running.current = false;
			if (statusOk.current && viewKey(latest.current) !== viewKey(savedRef.current) && pinRef.current) drain();
		}
	}
	function edit(recipe, when = "soon") {
		const next = recipe(latest.current);
		latest.current = next;
		setBoard(next);
		if (when === "now") {
			window.clearTimeout(debounce.current);
			drain();
		} else {
			window.clearTimeout(debounce.current);
			debounce.current = window.setTimeout(() => void drain(), 500);
		}
	}
	function ask(state, run) {
		confirmRun.current = run;
		setConfirm(state);
	}
	async function onLogin(event) {
		event.preventDefault();
		setBusyLogin(true);
		setLoginError("");
		try {
			await verifyPin({ data: { pin: draftPin } });
			sessionStorage.setItem(PIN_KEY, draftPin);
			pinRef.current = draftPin;
			setPin(draftPin);
			setGate("in");
		} catch (reason) {
			setLoginError(errorText(reason));
		} finally {
			setBusyLogin(false);
		}
	}
	function logout() {
		sessionStorage.removeItem(PIN_KEY);
		pinRef.current = "";
		setPin("");
		setDraftPin("");
		setGate("out");
	}
	function patchTeam(id, recipe, when = "now") {
		edit((current) => ({
			...current,
			contingents: current.contingents.map((row) => row.id === id ? recipe(row) : row)
		}), when);
	}
	async function onPickImage(file, apply, maxEdge, limit) {
		if (!file) return;
		try {
			apply(await compressImage(file, maxEdge, maxEdge > 600 ? .68 : .82, limit));
		} catch (reason) {
			toast.error(errorText(reason));
		}
	}
	function addTeam(event) {
		event.preventDefault();
		const name = newName.trim();
		if (!name) return;
		if (latest.current.contingents.some((row) => normName(row.name) === normName(name))) {
			toast.error("Nama kontingen sudah ada.");
			return;
		}
		const row = {
			id: newId(),
			name,
			logo: "",
			gold: 0,
			silver: 0,
			bronze: 0,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		edit((current) => ({
			...current,
			contingents: [...current.contingents, row]
		}), "now");
		setNewName("");
	}
	async function onReset() {
		try {
			const result = await resetBoard({ data: { pin: pinRef.current } });
			window.clearTimeout(debounce.current);
			latest.current = result;
			savedRef.current = result;
			setBoard(result);
			setSaved(result);
			setStatus("saved");
			setError("");
			toast("Data dikembalikan ke awal");
		} catch (reason) {
			toast.error(errorText(reason));
		}
	}
	async function onImport(file) {
		if (!file) return;
		try {
			const text = await file.text();
			const rows = parseCsv(text);
			const merged = applyImport(latest.current.contingents, rows);
			edit((current) => ({
				...current,
				contingents: merged
			}), "now");
			toast("Data CSV siap disimpan");
		} catch (reason) {
			toast.error(errorText(reason));
		}
	}
	async function onChangePin(event) {
		event.preventDefault();
		try {
			const result = await changePin({ data: {
				pin: pinRef.current,
				nextPin
			} });
			sessionStorage.setItem(PIN_KEY, nextPin);
			pinRef.current = nextPin;
			setPin(nextPin);
			setNextPin("");
			setBoard((current) => {
				const next = {
					...current,
					settings: {
						...current.settings,
						pinIsDefault: result.pinIsDefault
					}
				};
				latest.current = {
					...latest.current,
					settings: next.settings
				};
				return next;
			});
			toast("PIN panitia diperbarui");
		} catch (reason) {
			toast.error(errorText(reason));
		}
	}
	if (gate !== "in") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center bg-navy-950 px-4 py-10 text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: onLogin,
			className: "w-full max-w-md rounded-2xl bg-ink p-6 text-navy-950",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-gold-ink",
					children: "POR SD BENJENG 2026"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-4xl leading-none",
					children: "Login admin"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-navy-950/75",
					children: "Khusus panitia. Perubahan medali akan tampil di papan klasemen."
				}),
				gate === "checking" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm",
					children: "Memeriksa akses panitia…"
				}) : null,
				gate === "out" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					initial.settings.pinIsDefault ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 rounded-lg bg-gold/25 px-3 py-2 text-sm",
						children: [
							"PIN awal: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: DEFAULT_PIN }),
							". Ganti setelah masuk."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm",
						children: "Masukkan PIN panitia yang sudah diatur."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-4 block text-sm font-semibold",
						htmlFor: "pin",
						children: "PIN panitia"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "pin",
							name: "pin",
							autoComplete: "current-password",
							type: showPin ? "text" : "password",
							value: draftPin,
							onChange: (event) => setDraftPin(event.target.value),
							className: "h-11 w-full rounded-lg border border-navy-900/20 bg-field px-3 text-navy-950"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "press h-11 shrink-0 rounded-lg border border-navy-900/20 px-3 text-sm",
							onClick: () => setShowPin((value) => !value),
							children: showPin ? "Sembunyi" : "Lihat"
						})]
					}),
					loginError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-accent",
						children: loginError
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: busyLogin || draftPin.trim().length < 4,
						className: "press mt-4 h-11 w-full rounded-lg bg-gold font-semibold text-gold-ink disabled:opacity-50",
						children: busyLogin ? "Memeriksa…" : "Masuk"
					})
				] }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-4 inline-flex h-11 items-center text-sm font-semibold text-navy-800",
					children: "Kembali ke papan klasemen"
				})
			]
		})
	});
	const shown = rankContingents(board.contingents).filter((row) => normName(row.name).includes(normName(query))).sort((a, b) => sortMode === "name" ? a.name.localeCompare(b.name, "id") : a.rank - b.rank || a.name.localeCompare(b.name, "id"));
	const sum = totals(board.contingents);
	const dirty = viewKey(board) !== viewKey(saved);
	const statusLabel = status === "saving" ? "Menyimpan…" : status === "error" ? error : dirty ? "Menyimpan perubahan…" : `Tersimpan · ${formatWib(latestStamp(saved))}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-navy-950 text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "border-b border-ink/15 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-gold",
						children: "PANEL PANITIA"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl leading-none",
						children: "Live medal standing"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "press inline-flex h-11 items-center rounded-full border border-ink/25 px-4 text-sm",
							children: "Lihat papan"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "press inline-flex h-11 items-center gap-2 rounded-full border border-ink/25 px-4 text-sm",
							onClick: logout,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Keluar"]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex gap-2 overflow-x-auto pb-1",
					children: TABS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTab(item.id),
						className: item.id === tab ? "h-11 shrink-0 rounded-full bg-gold px-4 text-sm font-semibold text-gold-ink" : "h-11 shrink-0 rounded-full border border-ink/20 px-4 text-sm",
						children: item.label
					}, item.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto w-full max-w-5xl px-4 py-4 pb-28",
				children: [
					tab === "medali" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-end justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Input medali"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-ink/70",
								children: [
									sum.teams,
									" kontingen · ",
									sum.gold,
									" emas · ",
									sum.silver,
									" perak · ",
									sum.bronze,
									" perunggu · total ",
									sum.all
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: sortMode === "rank" ? "h-10 rounded-full bg-ink px-3 text-sm font-semibold text-navy-950" : "h-10 rounded-full border border-ink/25 px-3 text-sm",
									onClick: () => setSortMode("rank"),
									children: "Peringkat"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: sortMode === "name" ? "h-10 rounded-full bg-ink px-3 text-sm font-semibold text-navy-950" : "h-10 rounded-full border border-ink/25 px-3 text-sm",
									onClick: () => setSortMode("name"),
									children: "Nama"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mt-3 block text-sm",
							htmlFor: "cari",
							children: "Cari kontingen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "cari",
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "Contoh: 100 atau Muhammadiyah",
							className: "mt-1 h-11 w-full rounded-lg border border-ink/20 bg-ink px-3 text-navy-950"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-col gap-2",
							children: [shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-ink/70",
								children: "Tidak ada kontingen dengan kata itu."
							}) : null, shown.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-xl bg-ink p-3 text-navy-950",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamMark, {
										name: row.name,
										src: row.logo
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate font-semibold",
											children: row.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-navy-950/60",
											children: [
												"Peringkat ",
												row.rank,
												" · total ",
												row.total
											]
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 grid gap-2 sm:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedalStepper, {
											label: "Emas",
											value: row.gold,
											tone: "gold",
											onChange: (value, when) => patchTeam(row.id, (item) => ({
												...item,
												gold: value
											}), when)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedalStepper, {
											label: "Perak",
											value: row.silver,
											tone: "silver",
											onChange: (value, when) => patchTeam(row.id, (item) => ({
												...item,
												silver: value
											}), when)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedalStepper, {
											label: "Perunggu",
											value: row.bronze,
											tone: "bronze",
											onChange: (value, when) => patchTeam(row.id, (item) => ({
												...item,
												bronze: value
											}), when)
										})
									]
								})]
							}, row.id))]
						})
					] }) : null,
					tab === "kontingen" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Kontingen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: addTeam,
							className: "mt-3 flex flex-col gap-2 sm:flex-row",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "sr-only",
									htmlFor: "baru",
									children: "Nama kontingen baru"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "baru",
									value: newName,
									onChange: (event) => setNewName(event.target.value),
									placeholder: "Nama kontingen baru",
									className: "h-11 w-full rounded-lg border border-ink/20 bg-ink px-3 text-navy-950"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "press h-11 shrink-0 rounded-lg bg-gold px-4 font-semibold text-gold-ink",
									children: "Tambah"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-col gap-2",
							children: [...board.contingents].sort((a, b) => a.name.localeCompare(b.name, "id")).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
								className: "rounded-xl bg-ink p-3 text-navy-950",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamMark, {
											name: row.name,
											src: row.logo
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "sr-only",
											htmlFor: `nama-${row.id}`,
											children: ["Nama ", row.name]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: `nama-${row.id}`,
											value: row.name,
											onChange: (event) => patchTeam(row.id, (item) => ({
												...item,
												name: event.target.value
											}), "soon"),
											className: "h-11 min-w-0 flex-1 rounded-lg border border-navy-900/15 bg-field px-3"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "press inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-navy-900/15 px-3 text-sm",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
													className: "size-4",
													"aria-hidden": "true"
												}),
												"Logo",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "file",
													accept: "image/png,image/jpeg,image/webp",
													className: "sr-only",
													onChange: (event) => {
														const file = event.target.files?.[0];
														onPickImage(file, (logo) => patchTeam(row.id, (item) => ({
															...item,
															logo
														}), "now"), 160, 8e4);
														event.target.value = "";
													}
												})
											]
										}),
										row.logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "h-11 rounded-lg border border-navy-900/15 px-3 text-sm",
											onClick: () => patchTeam(row.id, (item) => ({
												...item,
												logo: ""
											}), "now"),
											children: "Hapus logo"
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "press inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-ink",
											onClick: () => ask({
												title: "Hapus kontingen?",
												body: `${row.name} dan seluruh medalinya akan dihapus dari klasemen.`,
												label: "Hapus",
												danger: true
											}, () => edit((current) => ({
												...current,
												contingents: current.contingents.filter((item) => item.id !== row.id)
											}), "now")),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
												className: "size-4",
												"aria-hidden": "true"
											}), "Hapus"]
										})
									]
								})
							}, row.id))
						})
					] }) : null,
					tab === "header" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl bg-ink p-4 text-navy-950",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Header papan"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Judul utama",
								value: board.settings.title,
								onChange: (title) => edit((current) => ({
									...current,
									settings: {
										...current.settings,
										title
									}
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Subjudul",
								value: board.settings.subtitle,
								onChange: (subtitle) => edit((current) => ({
									...current,
									settings: {
										...current.settings,
										subtitle
									}
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Tulisan tambahan",
								value: board.settings.tagline,
								onChange: (tagline) => edit((current) => ({
									...current,
									settings: {
										...current.settings,
										tagline
									}
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Informasi acara",
								value: board.settings.eventNote,
								onChange: (eventNote) => edit((current) => ({
									...current,
									settings: {
										...current.settings,
										eventNote
									}
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoField, {
										label: "Logo penyelenggara 1",
										src: board.settings.logo1,
										onPick: (file) => void onPickImage(file, (logo1) => edit((current) => ({
											...current,
											settings: {
												...current.settings,
												logo1
											}
										}), "now"), 360, 12e4),
										onClear: () => edit((current) => ({
											...current,
											settings: {
												...current.settings,
												logo1: ""
											}
										}), "now")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoField, {
										label: "Logo penyelenggara 2",
										src: board.settings.logo2,
										onPick: (file) => void onPickImage(file, (logo2) => edit((current) => ({
											...current,
											settings: {
												...current.settings,
												logo2
											}
										}), "now"), 360, 12e4),
										onClear: () => edit((current) => ({
											...current,
											settings: {
												...current.settings,
												logo2: ""
											}
										}), "now")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoField, {
										label: "Logo penyelenggara 3",
										src: board.settings.logo3,
										onPick: (file) => void onPickImage(file, (logo3) => edit((current) => ({
											...current,
											settings: {
												...current.settings,
												logo3
											}
										}), "now"), 360, 12e4),
										onClear: () => edit((current) => ({
											...current,
											settings: {
												...current.settings,
												logo3: ""
											}
										}), "now")
									})
								]
							})
						]
					}) : null,
					tab === "tampilan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl bg-ink p-4 text-navy-950",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Tampilan"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-navy-950/70",
								children: "Gunakan latar gelap supaya nama dan angka tetap terbaca di proyektor."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 grid gap-3 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
										label: "Warna latar",
										value: board.settings.colorNavy,
										onChange: (colorNavy) => edit((current) => ({
											...current,
											settings: {
												...current.settings,
												colorNavy
											}
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
										label: "Warna teks",
										value: board.settings.colorPaper,
										onChange: (colorPaper) => edit((current) => ({
											...current,
											settings: {
												...current.settings,
												colorPaper
											}
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
										label: "Warna emas",
										value: board.settings.colorGold,
										onChange: (colorGold) => edit((current) => ({
											...current,
											settings: {
												...current.settings,
												colorGold
											}
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
										label: "Warna aksen",
										value: board.settings.colorAccent,
										onChange: (colorAccent) => edit((current) => ({
											...current,
											settings: {
												...current.settings,
												colorAccent
											}
										}))
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-xl p-4",
								style: {
									background: board.settings.colorNavy,
									color: board.settings.colorPaper
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs tracking-widest",
										style: { color: board.settings.colorGold },
										children: "PRATINJAU"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-3xl",
										children: board.settings.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-4xl",
										style: { color: board.settings.colorGold },
										children: "12"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "press inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-navy-900/15 px-3 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
												className: "size-4",
												"aria-hidden": "true"
											}),
											"Unggah latar",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "file",
												accept: "image/png,image/jpeg,image/webp",
												className: "sr-only",
												onChange: (event) => {
													const file = event.target.files?.[0];
													onPickImage(file, (background) => edit((current) => ({
														...current,
														settings: {
															...current.settings,
															background
														}
													}), "now"), 1400, 28e4);
													event.target.value = "";
												}
											})
										]
									}),
									board.settings.background ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "h-11 rounded-lg border border-navy-900/15 px-3 text-sm",
										onClick: () => edit((current) => ({
											...current,
											settings: {
												...current.settings,
												background: ""
											}
										}), "now"),
										children: "Hapus latar"
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "h-11 rounded-lg border border-navy-900/15 px-3 text-sm",
										onClick: () => edit((current) => ({
											...current,
											settings: {
												...current.settings,
												colorNavy: DEFAULT_COPY.colorNavy,
												colorGold: DEFAULT_COPY.colorGold,
												colorAccent: DEFAULT_COPY.colorAccent,
												colorPaper: DEFAULT_COPY.colorPaper
											}
										}), "now"),
										children: "Warna bawaan"
									})
								]
							}),
							board.settings.background ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: board.settings.background,
								alt: "Pratinjau latar",
								className: "mt-3 h-28 w-full rounded-xl object-cover"
							}) : null
						]
					}) : null,
					tab === "data" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-ink p-4 text-navy-950",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-2xl",
										children: "Ekspor dan impor"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-navy-950/70",
										children: "File CSV memakai titik koma agar langsung terbuka di Excel. Kolom: id, nama, emas, perak, perunggu. Logo tetap jika nama atau id sama."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "press inline-flex h-11 items-center gap-2 rounded-lg bg-navy-900 px-4 text-sm font-semibold text-ink",
											onClick: () => downloadText("klasemen-por-benjeng-2026.csv", toCsv(board.contingents), "text/csv;charset=utf-8"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
												className: "size-4",
												"aria-hidden": "true"
											}), "Ekspor CSV"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "press inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-navy-900/15 px-4 text-sm font-semibold",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
													className: "size-4",
													"aria-hidden": "true"
												}),
												"Impor CSV",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "file",
													accept: ".csv,text/csv",
													className: "sr-only",
													onChange: (event) => {
														const file = event.target.files?.[0];
														if (!file) return;
														ask({
															title: "Impor data CSV?",
															body: "Daftar kontingen dan medali akan diganti sesuai file. Logo dipertahankan bila nama atau id sama.",
															label: "Impor",
															danger: true
														}, () => void onImport(file));
														event.target.value = "";
													}
												})
											]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: onChangePin,
								className: "rounded-2xl bg-ink p-4 text-navy-950",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-2xl",
										children: "Ganti PIN"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mt-3 block text-sm font-semibold",
										htmlFor: "pin-baru",
										children: "PIN baru"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "pin-baru",
										type: "text",
										value: nextPin,
										onChange: (event) => setNextPin(event.target.value),
										className: "mt-1 h-11 w-full rounded-lg border border-navy-900/15 bg-field px-3"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										disabled: nextPin.trim().length < 4,
										className: "press mt-3 h-11 rounded-lg bg-gold px-4 font-semibold text-gold-ink disabled:opacity-50",
										children: "Simpan PIN"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-accent/50 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-2xl",
										children: "Reset data"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-ink/75",
										children: "Mengembalikan 28 kontingen awal, mengosongkan medali, serta judul dan tampilan bawaan. PIN tidak berubah."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "press mt-3 inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-ink",
										onClick: () => ask({
											title: "Reset seluruh data?",
											body: "Semua medali, logo, dan perubahan tulisan akan hilang. Tindakan ini tidak bisa dibatalkan.",
											label: "Reset data",
											danger: true
										}, () => void onReset()),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
											className: "size-4",
											"aria-hidden": "true"
										}), "Reset data"]
									})
								]
							})
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-0 bottom-0 z-20 border-t border-ink/15 bg-navy-950/95 px-4 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex w-full max-w-5xl items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: status === "error" ? "text-sm text-accent" : "text-sm text-ink/75",
						children: statusLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "press inline-flex h-11 items-center gap-2 rounded-full bg-gold px-4 text-sm font-semibold text-gold-ink",
						onClick: () => void drain(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {
							className: "size-4",
							"aria-hidden": "true"
						}), "Simpan perubahan"]
					})]
				})
			}),
			confirm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-40 flex items-end justify-center bg-navy-950/70 p-4 sm:items-center",
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "confirm-title",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md rounded-2xl bg-ink p-5 text-navy-950",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "confirm-title",
							className: "font-display text-3xl leading-none",
							children: confirm.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-navy-950/80",
							children: confirm.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-11 rounded-lg border border-navy-900/15 px-4 text-sm",
								onClick: () => setConfirm(null),
								children: "Batal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: confirm.danger ? "press h-11 rounded-lg bg-accent px-4 text-sm font-semibold text-ink" : "press h-11 rounded-lg bg-gold px-4 text-sm font-semibold text-gold-ink",
								onClick: () => {
									const run = confirmRun.current;
									setConfirm(null);
									run?.();
								},
								children: confirm.label
							})]
						})
					]
				})
			}) : null
		]
	});
}
function Field({ label, value, onChange }) {
	const id = label.toLowerCase().replace(/\s+/g, "-");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mt-3 block text-sm font-semibold",
		htmlFor: id,
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			id,
			value,
			onChange: (event) => onChange(event.target.value),
			className: "mt-1 h-11 w-full rounded-lg border border-navy-900/15 bg-field px-3 font-normal"
		})]
	});
}
function ColorField({ label, value, onChange }) {
	const id = `warna-${label.toLowerCase().replace(/\s+/g, "-")}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex items-center justify-between gap-3 rounded-lg border border-navy-900/15 px-3 py-2 text-sm font-semibold",
		htmlFor: id,
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			id,
			type: "color",
			value: /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#0c1b33",
			onChange: (event) => onChange(event.target.value),
			className: "h-11 w-14 cursor-pointer bg-transparent"
		})]
	});
}
function LogoField({ label, src, onPick, onClear }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-navy-900/15 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center gap-3",
				children: [src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src,
					alt: "",
					className: "h-14 w-14 rounded-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex h-14 w-14 items-center justify-center rounded-full bg-navy-900/10 text-xs",
					children: "Kosong"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "press inline-flex h-11 cursor-pointer items-center rounded-lg border border-navy-900/15 px-3 text-sm",
					children: ["Unggah", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: "image/png,image/jpeg,image/webp",
						className: "sr-only",
						onChange: (event) => {
							onPick(event.target.files?.[0]);
							event.target.value = "";
						}
					})]
				})]
			}),
			src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-2 text-sm underline",
				onClick: onClear,
				children: "Hapus logo"
			}) : null
		]
	});
}
function MedalStepper({ label, value, tone, onChange }) {
	const ring = tone === "gold" ? "bg-gold text-gold-ink" : "border border-navy-900/20";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-navy-900/10 p-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold tracking-wide text-navy-950/60",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex items-center gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Kurangi ${label}`,
					disabled: value <= 0,
					className: "press inline-flex h-11 w-11 items-center justify-center rounded-lg border border-navy-900/15 disabled:opacity-40",
					onClick: () => onChange(clampMedal(value - 1), "now"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
						className: "size-4",
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					"aria-label": `Jumlah ${label}`,
					inputMode: "numeric",
					value: String(value),
					onFocus: (event) => event.target.select(),
					onChange: (event) => {
						const digits = event.target.value.replace(/\D/g, "").slice(0, 3);
						onChange(digits === "" ? 0 : clampMedal(Number(digits)), "soon");
					},
					className: "h-11 w-full rounded-lg bg-field text-center font-display text-2xl tabular-nums"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Tambah ${label}`,
					className: `press inline-flex h-11 w-11 items-center justify-center rounded-lg ${ring}`,
					onClick: () => onChange(clampMedal(value + 1), "now"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-4",
						"aria-hidden": "true"
					})
				})
			]
		})]
	});
}
function AdminPage() {
	const initial = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminDashboard, { initial });
}
//#endregion
export { AdminPage as component };
