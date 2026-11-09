import { o as __toESM } from "../_runtime.mjs";
import { b as totals, c as formatWib, g as rankMoves, h as rankContingents, l as latestStamp, u as medalDeltas, x as viewKey } from "./model-CIMqvaBA.mjs";
import { S as require_jsx_runtime, Y as require_react, b as Link, n as require_react_dom } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as ChevronDown, d as Medal, f as Maximize2, g as ChevronUp, n as Trophy, s as Printer, u as Minimize2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as getBoard, r as Route$1 } from "./router-DMXjnYOl.mjs";
import { n as TeamMark, t as OrgLogo } from "./marks-DCKPQSFT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-557u2QfI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
function useLiveBoard(initial) {
	const [board, setBoard] = (0, import_react.useState)(initial);
	const [link, setLink] = (0, import_react.useState)("live");
	const [flash, setFlash] = (0, import_react.useState)({});
	const [moves, setMoves] = (0, import_react.useState)({});
	const [announce, setAnnounce] = (0, import_react.useState)("");
	const prev = (0, import_react.useRef)(initial);
	const token = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		let clearFlash = 0;
		async function pull() {
			try {
				const next = await getBoard({ data: { t: Date.now() } });
				if (cancel) return;
				const before = prev.current;
				if (viewKey(before) === viewKey(next)) {
					setLink("live");
					return;
				}
				const changes = medalDeltas(before.contingents, next.contingents);
				const moveMap = rankMoves(before.contingents, next.contingents);
				const flashMap = {};
				if (changes.ids.length || Object.keys(moveMap).length) {
					token.current += 1;
					for (const id of /* @__PURE__ */ new Set([...changes.ids, ...Object.keys(moveMap)])) flashMap[id] = token.current;
				}
				const orderBefore = rankContingents(before.contingents).map((row) => row.id).join("|");
				const orderAfter = rankContingents(next.contingents).map((row) => row.id).join("|");
				prev.current = next;
				const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
				const start = document.startViewTransition;
				if (orderBefore !== orderAfter && start && !reduce) start(() => {
					(0, import_react_dom.flushSync)(() => setBoard(next));
				});
				else setBoard(next);
				setFlash(flashMap);
				setMoves(moveMap);
				setLink("live");
				if (changes.text) {
					setAnnounce(changes.text);
					toast("Perolehan medali berubah", {
						id: "medal-change",
						description: changes.text
					});
				}
				window.clearTimeout(clearFlash);
				clearFlash = window.setTimeout(() => {
					setFlash({});
					setMoves({});
				}, 4e3);
			} catch {
				if (!cancel) setLink("offline");
			}
		}
		const interval = window.setInterval(() => void pull(), 4e3);
		return () => {
			cancel = true;
			window.clearInterval(interval);
			window.clearTimeout(clearFlash);
		};
	}, []);
	return {
		board,
		link,
		flash,
		moves,
		announce
	};
}
function themeStyle(board) {
	return {
		"--color-navy-950": board.settings.colorNavy,
		"--color-navy-900": board.settings.colorNavy,
		"--color-ink": board.settings.colorPaper,
		"--color-gold": board.settings.colorGold,
		"--color-accent": board.settings.colorAccent
	};
}
function RankMark({ rank, show }) {
	if (!show) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-block size-4 shrink-0",
		"aria-hidden": "true"
	});
	if (rank === 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, {
		className: "size-4 shrink-0 text-gold",
		"aria-hidden": "true"
	});
	if (rank === 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Medal, {
		className: "size-4 shrink-0 text-silver",
		"aria-hidden": "true"
	});
	if (rank === 3) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Medal, {
		className: "size-4 shrink-0 text-bronze",
		"aria-hidden": "true"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-block size-4 shrink-0",
		"aria-hidden": "true"
	});
}
function StandingRow({ row, flashToken, move, podium }) {
	const sheen = flashToken ? "row-sheen" : "";
	const label = `Peringkat ${row.rank}. ${row.name}. ${row.gold} emas, ${row.silver} perak, ${row.bronze} perunggu. Total ${row.total}.`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "row",
		"aria-label": label,
		className: `stand-row ${podium} ${sheen}`,
		style: { viewTransitionName: `team-${row.id}` },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "cell",
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankMark, {
						rank: row.rank,
						show: podium !== ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-xl font-bold tabular-nums leading-none md:text-2xl",
						children: row.rank
					}),
					move && move > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "move-up inline-flex items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, {
							className: "size-3",
							"aria-hidden": "true"
						}), move]
					}) : move && move < 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "move-down inline-flex items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
							className: "size-3",
							"aria-hidden": "true"
						}), Math.abs(move)]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "cell",
				className: "flex min-w-0 items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamMark, {
					name: row.name,
					src: row.logo
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "team-name min-w-0",
					children: row.name
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "cell",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: flashToken ? "medal-num num-gold tick" : "medal-num num-gold",
					children: row.gold
				}, flashToken ? `g-${row.gold}-${flashToken}` : "g")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "cell",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: flashToken ? "medal-num num-silver tick" : "medal-num num-silver",
					children: row.silver
				}, flashToken ? `s-${row.silver}-${flashToken}` : "s")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "cell",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: flashToken ? "medal-num num-bronze tick" : "medal-num num-bronze",
					children: row.bronze
				}, flashToken ? `b-${row.bronze}-${flashToken}` : "b")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "cell",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "medal-num num-total",
					children: row.total
				})
			})
		]
	});
}
function ColumnHead({ tone, label }) {
	if (tone === "total") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-center",
		children: "Total"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "head-medal",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `medal medal-${tone}`,
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "head-word",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: label
			})
		]
	});
}
function Scoreboard({ initial }) {
	const { board, link, flash, moves, announce } = useLiveBoard(initial);
	const shellRef = (0, import_react.useRef)(null);
	const [fs, setFs] = (0, import_react.useState)(false);
	const ranked = rankContingents(board.contingents);
	const rankCount = /* @__PURE__ */ new Map();
	for (const row of ranked) rankCount.set(row.rank, (rankCount.get(row.rank) ?? 0) + 1);
	const podiumFor = (rank) => {
		const count = rankCount.get(rank) ?? 0;
		if (rank > 3 || count > 3) return "";
		if (rank === 1) return "podium-1";
		if (rank === 2) return "podium-2";
		return "podium-3";
	};
	const sum = totals(board.contingents);
	const stamp = latestStamp(board);
	(0, import_react.useEffect)(() => {
		document.title = board.settings.title;
	}, [board.settings.title]);
	(0, import_react.useEffect)(() => {
		const onChange = () => setFs(document.fullscreenElement === shellRef.current);
		document.addEventListener("fullscreenchange", onChange);
		return () => document.removeEventListener("fullscreenchange", onChange);
	}, []);
	function toggleFullscreen() {
		if (document.fullscreenElement) document.exitFullscreen();
		else shellRef.current?.requestFullscreen();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: shellRef,
		className: board.settings.background ? `score-shell has-photo${fs ? " is-fs" : ""}` : `score-shell${fs ? " is-fs" : ""}`,
		style: themeStyle(board),
		children: [
			board.settings.background ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				className: "bg-layer",
				src: board.settings.background,
				alt: ""
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "score-shade" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "score-content",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "border-b-2 border-gold pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex w-full flex-col items-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-center gap-3 md:gap-5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrgLogo, {
												src: board.settings.logo1,
												index: 0,
												alt: "Logo penyelenggara 1"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrgLogo, {
												src: board.settings.logo2,
												index: 1,
												alt: "Logo penyelenggara 2"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrgLogo, {
												src: board.settings.logo3,
												index: 2,
												alt: "Logo penyelenggara 3"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "board-title mt-2 text-center",
										children: board.settings.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 max-w-3xl text-center text-sm text-ink/75 md:text-base",
										children: board.settings.subtitle
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "fs-hide mt-1 text-center text-xs font-semibold tracking-widest text-gold",
										children: board.settings.tagline
									})
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "no-print mt-3 flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2 text-xs md:text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex h-8 items-center gap-2 rounded-full border border-accent/60 px-3 font-semibold tracking-widest",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: link === "live" ? "live-dot size-2 rounded-full bg-accent" : "size-2 rounded-full bg-ink/40" }), link === "live" ? "LIVE" : "TERPUTUS"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-ink/70",
									children: ["Diperbarui ", formatWib(stamp)]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "press inline-flex h-11 items-center gap-2 rounded-full border border-ink/25 px-3 text-sm",
										onClick: toggleFullscreen,
										children: [fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, {
											className: "size-4",
											"aria-hidden": "true"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, {
											className: "size-4",
											"aria-hidden": "true"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: fs ? "Keluar layar penuh" : "Layar penuh"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "press inline-flex h-11 items-center gap-2 rounded-full border border-ink/25 px-3 text-sm",
										onClick: () => window.print(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, {
											className: "size-4",
											"aria-hidden": "true"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: "Cetak"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/admin",
										className: "press inline-flex h-11 items-center rounded-full bg-gold px-4 text-sm font-semibold text-gold-ink",
										children: "Login admin"
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-3 grid grid-cols-2 gap-2 md:grid-cols-4",
						"aria-label": "Statistik kejuaraan",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Total kontingen",
								value: sum.teams
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Medali emas",
								value: sum.gold,
								tone: "text-gold"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Medali perak",
								value: sum.silver,
								tone: "text-silver"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Medali perunggu",
								value: sum.bronze,
								tone: "text-bronze"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-center text-sm text-ink/80",
						children: ["Total seluruh medali ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-2xl font-bold tabular-nums text-ink",
							children: sum.all
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "fs-hide text-center text-xs text-ink/60",
						children: "Peringkat dihitung dari medali emas. Emas yang sama berarti peringkat yang sama."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "stand-scroll",
						role: "table",
						"aria-label": "Klasemen medali",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "stand-head",
							role: "row",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									role: "columnheader",
									children: "Rank"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									role: "columnheader",
									children: "Kontingen"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									role: "columnheader",
									className: "text-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColumnHead, {
										tone: "gold",
										label: "Emas"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									role: "columnheader",
									className: "text-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColumnHead, {
										tone: "silver",
										label: "Perak"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									role: "columnheader",
									className: "text-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColumnHead, {
										tone: "bronze",
										label: "Perunggu"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									role: "columnheader",
									className: "text-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColumnHead, {
										tone: "total",
										label: "Total"
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "stand-list",
							role: "rowgroup",
							children: ranked.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 py-8 text-center text-ink/70",
								children: "Belum ada kontingen. Tambahkan dari panel panitia."
							}) : ranked.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StandingRow, {
								row,
								flashToken: flash[row.id],
								move: moves[row.id],
								podium: podiumFor(row.rank)
							}, row.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "sr-only",
						"aria-live": "polite",
						children: announce
					}),
					board.settings.eventNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
						className: "fs-hide mt-4 text-center text-xs tracking-wide text-ink/60",
						children: board.settings.eventNote
					}) : null
				]
			})
		]
	});
}
function Stat({ label, value, tone = "text-ink" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-ink/15 bg-ink/5 px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-wide text-ink/65",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `font-display text-3xl font-bold tabular-nums leading-none md:text-4xl ${tone}`,
			children: value
		})]
	});
}
function Home() {
	const initial = Route$1.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scoreboard, { initial });
}
//#endregion
export { Home as component };
