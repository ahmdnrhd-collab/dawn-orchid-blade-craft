import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Maximize2, Medal, Minimize2, Printer, Trophy } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { OrgLogo, TeamMark } from "@/components/board/marks";
import { useLiveBoard } from "@/components/board/use-live-board";
import { formatWib, latestStamp, rankContingents, totals, type Board, type RankedContingent } from "@/lib/medal/model";

function themeStyle(board: Board): CSSProperties {
  return {
    "--color-navy-950": board.settings.colorNavy,
    "--color-navy-900": board.settings.colorNavy,
    "--color-ink": board.settings.colorPaper,
    "--color-gold": board.settings.colorGold,
    "--color-accent": board.settings.colorAccent,
  } as CSSProperties;
}

function RankMark({ rank, show }: { rank: number; show: boolean }) {
  if (!show) return <span className="inline-block size-4 shrink-0" aria-hidden="true" />;
  if (rank === 1) return <Trophy className="size-4 shrink-0 text-gold" aria-hidden="true" />;
  if (rank === 2) return <Medal className="size-4 shrink-0 text-silver" aria-hidden="true" />;
  if (rank === 3) return <Medal className="size-4 shrink-0 text-bronze" aria-hidden="true" />;
  return <span className="inline-block size-4 shrink-0" aria-hidden="true" />;
}

function StandingRow({
  row,
  flashToken,
  move,
  podium,
}: {
  row: RankedContingent;
  flashToken?: number;
  move?: number;
  podium: string;
}) {
  const sheen = flashToken ? "row-sheen" : "";
  const label = `Peringkat ${row.rank}. ${row.name}. ${row.gold} emas, ${row.silver} perak, ${row.bronze} perunggu. Total ${row.total}.`;
  return (
    <div
      role="row"
      aria-label={label}
      className={`stand-row ${podium} ${sheen}`}
      style={{ viewTransitionName: `team-${row.id}` }}
    >
      <div role="cell" className="flex items-center gap-1">
        <RankMark rank={row.rank} show={podium !== ""} />
        <span className="font-display text-xl font-bold tabular-nums leading-none md:text-2xl">{row.rank}</span>
        {move && move > 0 ? (
          <span className="move-up inline-flex items-center">
            <ChevronUp className="size-3" aria-hidden="true" />
            {move}
          </span>
        ) : move && move < 0 ? (
          <span className="move-down inline-flex items-center">
            <ChevronDown className="size-3" aria-hidden="true" />
            {Math.abs(move)}
          </span>
        ) : null}
      </div>
      <div role="cell" className="flex min-w-0 items-center gap-2">
        <TeamMark name={row.name} src={row.logo} />
        <span className="team-name min-w-0">{row.name}</span>
      </div>
      <div role="cell">
        <span key={flashToken ? `g-${row.gold}-${flashToken}` : "g"} className={flashToken ? "medal-num num-gold tick" : "medal-num num-gold"}>
          {row.gold}
        </span>
      </div>
      <div role="cell">
        <span key={flashToken ? `s-${row.silver}-${flashToken}` : "s"} className={flashToken ? "medal-num num-silver tick" : "medal-num num-silver"}>
          {row.silver}
        </span>
      </div>
      <div role="cell">
        <span key={flashToken ? `b-${row.bronze}-${flashToken}` : "b"} className={flashToken ? "medal-num num-bronze tick" : "medal-num num-bronze"}>
          {row.bronze}
        </span>
      </div>
      <div role="cell">
        <span className="medal-num num-total">{row.total}</span>
      </div>
    </div>
  );
}

function ColumnHead({ tone, label }: { tone: "gold" | "silver" | "bronze" | "total"; label: string }) {
  if (tone === "total") {
    return <span className="text-center">Total</span>;
  }
  return (
    <span className="head-medal">
      <span className={`medal medal-${tone}`} aria-hidden="true" />
      <span className="head-word">{label}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Scoreboard({ initial }: { initial: Board }) {
  const { board, link, flash, moves, announce } = useLiveBoard(initial);
  const shellRef = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(false);
  const ranked = rankContingents(board.contingents);
  const rankCount = new Map<number, number>();
  for (const row of ranked) rankCount.set(row.rank, (rankCount.get(row.rank) ?? 0) + 1);
  const podiumFor = (rank: number) => {
    const count = rankCount.get(rank) ?? 0;
    if (rank > 3 || count > 3) return "";
    if (rank === 1) return "podium-1";
    if (rank === 2) return "podium-2";
    return "podium-3";
  };
  const sum = totals(board.contingents);
  const stamp = latestStamp(board);

  useEffect(() => {
    document.title = board.settings.title;
  }, [board.settings.title]);

  useEffect(() => {
    const onChange = () => setFs(document.fullscreenElement === shellRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void shellRef.current?.requestFullscreen();
  }

  return (
    <div
      ref={shellRef}
      className={board.settings.background ? `score-shell has-photo${fs ? " is-fs" : ""}` : `score-shell${fs ? " is-fs" : ""}`}
      style={themeStyle(board)}
    >
      {board.settings.background ? (
        <img className="bg-layer" src={board.settings.background} alt="" />
      ) : null}
      <div className="score-shade" />
      <div className="score-content">
        <header className="border-b-2 border-gold pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex w-full flex-col items-center">
              <div className="flex items-center justify-center gap-3 md:gap-5">
                <OrgLogo src={board.settings.logo1} index={0} alt="Logo penyelenggara 1" />
                <OrgLogo src={board.settings.logo2} index={1} alt="Logo penyelenggara 2" />
                <OrgLogo src={board.settings.logo3} index={2} alt="Logo penyelenggara 3" />
              </div>
              <h1 className="board-title mt-2 text-center">{board.settings.title}</h1>
              <p className="mt-1 max-w-3xl text-center text-sm text-ink/75 md:text-base">{board.settings.subtitle}</p>
              <p className="fs-hide mt-1 text-center text-xs font-semibold tracking-widest text-gold">
                {board.settings.tagline}
              </p>
            </div>
          </div>
          <div className="no-print mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
              <span className="inline-flex h-8 items-center gap-2 rounded-full border border-accent/60 px-3 font-semibold tracking-widest">
                <span className={link === "live" ? "live-dot size-2 rounded-full bg-accent" : "size-2 rounded-full bg-ink/40"} />
                {link === "live" ? "LIVE" : "TERPUTUS"}
              </span>
              <span className="text-ink/70">Diperbarui {formatWib(stamp)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="press inline-flex h-11 items-center gap-2 rounded-full border border-ink/25 px-3 text-sm" onClick={toggleFullscreen}>
                {fs ? <Minimize2 className="size-4" aria-hidden="true" /> : <Maximize2 className="size-4" aria-hidden="true" />}
                <span className="hidden sm:inline">{fs ? "Keluar layar penuh" : "Layar penuh"}</span>
              </button>
              <button type="button" className="press inline-flex h-11 items-center gap-2 rounded-full border border-ink/25 px-3 text-sm" onClick={() => window.print()}>
                <Printer className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Cetak</span>
              </button>
              <Link
                to="/admin"
                className="press inline-flex h-11 items-center rounded-full bg-gold px-4 text-sm font-semibold text-gold-ink"
              >
                Login admin
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4" aria-label="Statistik kejuaraan">
          <Stat label="Total kontingen" value={sum.teams} />
          <Stat label="Medali emas" value={sum.gold} tone="text-gold" />
          <Stat label="Medali perak" value={sum.silver} tone="text-silver" />
          <Stat label="Medali perunggu" value={sum.bronze} tone="text-bronze" />
        </section>
        <p className="mt-2 text-center text-sm text-ink/80">
          Total seluruh medali <span className="font-display text-2xl font-bold tabular-nums text-ink">{sum.all}</span>
        </p>
        <p className="fs-hide text-center text-xs text-ink/60">
          Peringkat dihitung dari medali emas. Emas yang sama berarti peringkat yang sama.
        </p>

        <div className="stand-scroll" role="table" aria-label="Klasemen medali">
          <div className="stand-head" role="row">
            <span role="columnheader">Rank</span>
            <span role="columnheader">Kontingen</span>
            <span role="columnheader" className="text-center"><ColumnHead tone="gold" label="Emas" /></span>
            <span role="columnheader" className="text-center"><ColumnHead tone="silver" label="Perak" /></span>
            <span role="columnheader" className="text-center"><ColumnHead tone="bronze" label="Perunggu" /></span>
            <span role="columnheader" className="text-center"><ColumnHead tone="total" label="Total" /></span>
          </div>
          <div className="stand-list" role="rowgroup">
            {ranked.length === 0 ? (
              <p className="px-3 py-8 text-center text-ink/70">Belum ada kontingen. Tambahkan dari panel panitia.</p>
            ) : (
              ranked.map((row) => (
                <StandingRow key={row.id} row={row} flashToken={flash[row.id]} move={moves[row.id]} podium={podiumFor(row.rank)} />
              ))
            )}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">{announce}</p>
        {board.settings.eventNote ? (
          <footer className="fs-hide mt-4 text-center text-xs tracking-wide text-ink/60">{board.settings.eventNote}</footer>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "text-ink" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl border border-ink/15 bg-ink/5 px-3 py-2">
      <p className="text-xs font-medium tracking-wide text-ink/65">{label}</p>
      <p className={`font-display text-3xl font-bold tabular-nums leading-none md:text-4xl ${tone}`}>{value}</p>
    </div>
  );
}
