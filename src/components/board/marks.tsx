import { monogram } from "@/lib/medal/model";

export function Crest({ label, sub }: { label: string; sub: string }) {
  return (
    <svg viewBox="0 0 80 80" className="logo-slot" aria-hidden="true">
      <circle cx="40" cy="40" r="37" fill="var(--color-navy-950)" stroke="var(--color-gold)" strokeWidth="3" />
      <circle cx="40" cy="40" r="31" fill="none" stroke="var(--color-ink)" strokeOpacity="0.35" />
      <text
        x="40"
        y="38"
        textAnchor="middle"
        fill="var(--color-gold)"
        fontFamily="Barlow Condensed, sans-serif"
        fontSize="18"
        fontWeight="700"
      >
        {label}
      </text>
      <text
        x="40"
        y="54"
        textAnchor="middle"
        fill="var(--color-ink)"
        fontFamily="Outfit, sans-serif"
        fontSize="8"
        letterSpacing="1.4"
      >
        {sub}
      </text>
    </svg>
  );
}

const CRESTS = [
  { label: "POR", sub: "2026" },
  { label: "BJG", sub: "KEC" },
  { label: "GRS", sub: "KAB" },
] as const;

export function OrgLogo({ src, index, alt }: { src: string; index: 0 | 1 | 2; alt: string }) {
  if (src) {
    return <img src={src} alt={alt} className="logo-slot rounded-full object-cover ring-2 ring-gold" />;
  }
  return <Crest label={CRESTS[index].label} sub={CRESTS[index].sub} />;
}

export function TeamMark({ name, src }: { name: string; src: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full bg-ink object-cover ring-1 ring-ink/30"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/10 font-display text-sm font-semibold text-gold"
    >
      {monogram(name)}
    </span>
  );
}
