import { d as monogram } from "./model-CIMqvaBA.mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/marks-DCKPQSFT.js
var import_jsx_runtime = require_jsx_runtime();
function Crest({ label, sub }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 80 80",
		className: "logo-slot",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "40",
				cy: "40",
				r: "37",
				fill: "var(--color-navy-950)",
				stroke: "var(--color-gold)",
				strokeWidth: "3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "40",
				cy: "40",
				r: "31",
				fill: "none",
				stroke: "var(--color-ink)",
				strokeOpacity: "0.35"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "40",
				y: "38",
				textAnchor: "middle",
				fill: "var(--color-gold)",
				fontFamily: "Barlow Condensed, sans-serif",
				fontSize: "18",
				fontWeight: "700",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "40",
				y: "54",
				textAnchor: "middle",
				fill: "var(--color-ink)",
				fontFamily: "Outfit, sans-serif",
				fontSize: "8",
				letterSpacing: "1.4",
				children: sub
			})
		]
	});
}
var CRESTS = [
	{
		label: "POR",
		sub: "2026"
	},
	{
		label: "BJG",
		sub: "KEC"
	},
	{
		label: "GRS",
		sub: "KAB"
	}
];
function OrgLogo({ src, index, alt }) {
	if (src) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt,
		className: "logo-slot rounded-full object-cover ring-2 ring-gold"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
		label: CRESTS[index].label,
		sub: CRESTS[index].sub
	});
}
function TeamMark({ name, src }) {
	if (src) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt: "",
		className: "h-8 w-8 shrink-0 rounded-full bg-ink object-cover ring-1 ring-ink/30"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": "true",
		className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/10 font-display text-sm font-semibold text-gold",
		children: monogram(name)
	});
}
//#endregion
export { TeamMark as n, OrgLogo as t };
