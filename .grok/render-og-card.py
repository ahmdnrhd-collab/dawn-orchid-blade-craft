#!/usr/bin/env python3
"""Render the POR SD Benjeng medal-table share card to a 2400×1260 PNG."""

import math
from pathlib import Path

W, H = 1200, 630
CX = 600
# Medal sits in the upper half; the wordmark owns the lower half.
MEDAL_CY = 150
MEDAL_R = 94

NAVY = "#0C1B33"
NAVY_MID = "#163056"
CREAM = "#F6F3EC"
GOLD = "#E3B341"
GOLD_HI = "#F6E2A8"
GOLD_DEEP = "#A97820"
RED = "#E23D3D"


def star_points(cx, cy, r_out, r_in, n=5, rot_deg=-90):
    pts = []
    for i in range(n * 2):
        r = r_out if i % 2 == 0 else r_in
        a = math.radians(rot_deg + i * (180 / n))
        pts.append(f"{cx + r * math.cos(a):.2f},{cy + r * math.sin(a):.2f}")
    return " ".join(pts)


def arc(cx, cy, r, a0, a1):
    """SVG arc, angles in degrees, 0 = east, CCW, y-down compensated."""
    def pt(deg):
        a = math.radians(deg)
        return cx + r * math.cos(a), cy - r * math.sin(a)

    x0, y0 = pt(a0)
    x1, y1 = pt(a1)
    # Sweep in the direction of increasing mathematical angle (CCW on screen = sweep 0).
    large = 1 if abs(a1 - a0) % 360 > 180 else 0
    sweep = 0 if a1 > a0 else 1
    return f"M {x0:.2f},{y0:.2f} A {r:.2f},{r:.2f} 0 {large} {sweep} {x1:.2f},{y1:.2f}"


def leaf(cx, cy, theta_deg, length=18, width=7.2):
    """Pointed almond, tip outward. theta: 0 east, CCW."""
    a = math.radians(theta_deg)
    ox, oy = math.cos(a), -math.sin(a)  # outward
    px, py = -oy, ox  # perpendicular
    tip = (cx + ox * length, cy + oy * length)
    base = (cx - ox * (length * 0.42), cy - oy * (length * 0.42))
    left = (cx + px * width, cy + py * width)
    right = (cx - px * width, cy - py * width)
    # Quadratic-ish via two cubics is overkill; a diamond reads geometric.
    return (
        f"M {tip[0]:.2f},{tip[1]:.2f} "
        f"L {left[0]:.2f},{left[1]:.2f} "
        f"L {base[0]:.2f},{base[1]:.2f} "
        f"L {right[0]:.2f},{right[1]:.2f} Z"
    )


def laurel(side):
    """side = 1 right, -1 left. Open at the top for the ribbon."""
    parts = []
    stem_r = MEDAL_R + 28
    if side == 1:
        a0, a1 = -36, 58
    else:
        a0, a1 = 122, 216
    parts.append(
        f'<path d="{arc(CX, MEDAL_CY, stem_r, a0, a1)}" '
        f'fill="none" stroke="{GOLD}" stroke-width="2.2" stroke-linecap="round" opacity="0.9"/>'
    )
    steps = 9
    for i in range(steps):
        t = i / (steps - 1)
        theta = a0 + (a1 - a0) * t
        # Sit the leaf base on the stem, tip outward.
        a = math.radians(theta)
        bx = CX + stem_r * math.cos(a)
        by = MEDAL_CY - stem_r * math.sin(a)
        # Nudge origin slightly inward so the diamond straddles the stem.
        ix = CX + (stem_r - 2) * math.cos(a)
        iy = MEDAL_CY - (stem_r - 2) * math.sin(a)
        length = 16 if i in (0, steps - 1) else 20
        parts.append(
            f'<path d="{leaf(ix, iy, theta, length=length, width=6.4)}" fill="{GOLD}"/>'
        )
        # Smaller inner leaf, offset along the arc, for a double rank.
        if 0 < i < steps - 1:
            theta2 = theta + (4.2 * side)
            a2 = math.radians(theta2)
            jx = CX + (stem_r - 12) * math.cos(a2)
            jy = MEDAL_CY - (stem_r - 12) * math.sin(a2)
            parts.append(
                f'<path d="{leaf(jx, jy, theta2, length=12, width=4.4)}" fill="{GOLD_HI}" opacity="0.95"/>'
            )
    return "\n".join(parts)


def reeds():
    parts = []
    n = 64
    inner = MEDAL_R - 6
    outer = MEDAL_R + 5
    for i in range(n):
        # Skip the top gap where the ribbon meets the medal.
        theta = -90 + i * (360 / n)  # 0 at top, clockwise-ish via this start
        # Convert: this theta is degrees clockwise from up. Skip ±18° around up.
        if abs(((theta + 180) % 360) - 180) < 16 and False:
            pass
        a = math.radians(theta)
        # theta clockwise from up: x = sin, y = -cos
        s, c = math.sin(a), math.cos(a)
        x0, y0 = CX + inner * s, MEDAL_CY - inner * c
        x1, y1 = CX + outer * s, MEDAL_CY - outer * c
        # Leave a gap at the top (theta near 0).
        if -14 < theta < 14 or 346 < theta % 360:
            continue
        parts.append(
            f'<line x1="{x0:.2f}" y1="{y0:.2f}" x2="{x1:.2f}" y2="{y1:.2f}" '
            f'stroke="{GOLD_HI}" stroke-width="2.4" stroke-linecap="butt"/>'
        )
    return "\n".join(parts)


ribbon = f"""
  <polygon points="{CX-50},26 {CX-14},26 {CX-4},132 {CX-40},148" fill="{CREAM}"/>
  <polygon points="{CX+14},26 {CX+50},26 {CX+40},148 {CX+4},132" fill="{RED}"/>
  <polygon points="{CX-14},26 {CX+14},26 {CX+4},118 {CX-4},118" fill="{GOLD}"/>
"""

frame = f"""
  <rect x="28" y="22" width="1144" height="586" fill="none" stroke="{GOLD}" stroke-width="1.25" opacity="0.55"/>
  <rect x="36" y="30" width="1128" height="570" fill="none" stroke="{CREAM}" stroke-width="0.6" opacity="0.28"/>
  <path d="M28 46 V22 H52" fill="none" stroke="{GOLD_HI}" stroke-width="3"/>
  <path d="M1148 46 V22 H1172" fill="none" stroke="{GOLD_HI}" stroke-width="3" transform="translate(0)"/>
  <path d="M52 608 H28 V584" fill="none" stroke="{GOLD_HI}" stroke-width="3"/>
  <path d="M1148 608 H1172 V584" fill="none" stroke="{GOLD_HI}" stroke-width="3"/>
"""
# Fix right/top corner — I used a bad transform. Draw corners explicitly.
frame = f"""
  <rect x="32" y="24" width="1136" height="582" fill="none" stroke="{GOLD}" stroke-width="1.2" opacity="0.5"/>
  <path d="M32 52 V24 H60" fill="none" stroke="{GOLD_HI}" stroke-width="3" stroke-linejoin="miter"/>
  <path d="M1168 52 V24 H1140" fill="none" stroke="{GOLD_HI}" stroke-width="3" stroke-linejoin="miter"/>
  <path d="M32 578 V606 H60" fill="none" stroke="{GOLD_HI}" stroke-width="3" stroke-linejoin="miter"/>
  <path d="M1168 578 V606 H1140" fill="none" stroke="{GOLD_HI}" stroke-width="3" stroke-linejoin="miter"/>
"""

# Faint scoreboard lanes behind the lockup, stopped short of the type.
lanes = []
for y in (360, 448, 536):
    lanes.append(
        f'<line x1="78" y1="{y}" x2="250" y2="{y}" stroke="{CREAM}" stroke-width="1" opacity="0.16"/>'
    )
    lanes.append(
        f'<line x1="950" y1="{y}" x2="1122" y2="{y}" stroke="{CREAM}" stroke-width="1" opacity="0.16"/>'
    )
    lanes.append(
        f'<circle cx="70" cy="{y}" r="2.2" fill="{GOLD}" opacity="0.55"/>'
    )
    lanes.append(
        f'<circle cx="1130" cy="{y}" r="2.2" fill="{GOLD}" opacity="0.55"/>'
    )

svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    <radialGradient id="field" cx="50%" cy="38%" r="68%">
      <stop offset="0%" stop-color="#1B3A66"/>
      <stop offset="55%" stop-color="{NAVY_MID}"/>
      <stop offset="100%" stop-color="{NAVY}"/>
    </radialGradient>
    <radialGradient id="goldDisc" cx="38%" cy="32%" r="70%">
      <stop offset="0%" stop-color="{GOLD_HI}"/>
      <stop offset="42%" stop-color="{GOLD}"/>
      <stop offset="100%" stop-color="{GOLD_DEEP}"/>
    </radialGradient>
    <radialGradient id="face" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#1A3358"/>
      <stop offset="100%" stop-color="#0A1628"/>
    </radialGradient>
    <filter id="medalShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="{NAVY}"/>
  <rect width="{W}" height="{H}" fill="url(#field)"/>
  {''.join(lanes)}
  {frame}
  {ribbon}
  <g filter="url(#medalShadow)">
    <circle cx="{CX}" cy="{MEDAL_CY}" r="{MEDAL_R + 2}" fill="url(#goldDisc)"/>
  </g>
  {reeds()}
  <circle cx="{CX}" cy="{MEDAL_CY}" r="{MEDAL_R - 16}" fill="url(#face)" stroke="{GOLD}" stroke-width="3"/>
  <circle cx="{CX}" cy="{MEDAL_CY}" r="{MEDAL_R - 26}" fill="none" stroke="{GOLD}" stroke-width="1.2" opacity="0.8"/>
  <polygon points="{star_points(CX, MEDAL_CY + 1, 34, 14.5)}" fill="url(#goldDisc)"/>
  <ellipse cx="{CX - 24}" cy="{MEDAL_CY - 40}" rx="40" ry="18" fill="url(#sheen)"/>
  {laurel(1)}
  {laurel(-1)}
</svg>
"""

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<style>
  @font-face {{
    font-family: "Narrow";
    src: url("file:///usr/share/fonts/truetype/liberation/LiberationSansNarrow-Bold.ttf") format("truetype");
    font-weight: 700;
    font-style: normal;
  }}
  @font-face {{
    font-family: "Narrow";
    src: url("file:///usr/share/fonts/truetype/liberation/LiberationSansNarrow-Regular.ttf") format("truetype");
    font-weight: 400;
    font-style: normal;
  }}
  html, body {{
    margin: 0;
    width: {W}px;
    height: {H}px;
    overflow: hidden;
    background: {NAVY};
  }}
  .stage {{
    position: relative;
    width: {W}px;
    height: {H}px;
  }}
  .stage svg {{
    position: absolute;
    inset: 0;
    display: block;
  }}
  .lockup {{
    position: absolute;
    left: 180px;
    right: 180px;
    top: 268px;
    text-align: center;
    color: {CREAM};
    font-family: "Narrow", "Liberation Sans Narrow", sans-serif;
  }}
  .kicker {{
    font-weight: 700;
    font-size: 46px;
    letter-spacing: 0.42em;
    color: {CREAM};
    line-height: 1;
    margin-bottom: 4px;
  }}
  .word {{
    font-weight: 700;
    font-size: 118px;
    letter-spacing: 0.035em;
    line-height: 0.8;
    color: {CREAM};
  }}
  .rule {{
    width: 160px;
    height: 2px;
    margin: 10px auto 10px;
    background: {GOLD};
    opacity: 0.9;
  }}
  .tag {{
    font-weight: 700;
    font-size: 22px;
    letter-spacing: 0.3em;
    color: {GOLD};
    line-height: 1;
  }}
  .kicker span,
  .tag span {{
    display: inline-block;
  }}
  .kicker span {{ padding-left: 0.42em; }}
  .tag span {{ padding-left: 0.3em; }}
</style>
</head>
<body>
  <div class="stage">
    {svg}
    <div class="lockup">
      <div class="kicker"><span id="t-live">LIVE</span></div>
      <div class="word"><span id="t-medal">MEDAL</span></div>
      <div class="word"><span id="t-standing">STANDING</span></div>
      <div class="rule"></div>
      <div class="tag"><span id="t-tag">POR SD BENJENG 2026</span></div>
    </div>
  </div>
</body>
</html>
"""

out = Path("/workspace/.grok/og-card.html")
out.write_text(html)
print(f"wrote {out} ({out.stat().st_size} bytes)")
