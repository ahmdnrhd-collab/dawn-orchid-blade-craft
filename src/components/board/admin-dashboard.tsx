import { Link } from "@tanstack/react-router";
import { Download, ImagePlus, LogOut, Minus, Plus, RotateCcw, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { TeamMark } from "@/components/board/marks";
import { compressImage } from "@/lib/medal/images";
import {
  DEFAULT_COPY,
  DEFAULT_PIN,
  applyImport,
  clampMedal,
  downloadText,
  errorText,
  formatWib,
  latestStamp,
  newId,
  normName,
  parseCsv,
  rankContingents,
  toContingentInput,
  toCsv,
  toSettingsInput,
  totals,
  viewKey,
  type Board,
  type Contingent,
} from "@/lib/medal/model";
import { changePin, resetBoard, saveBoard, verifyPin } from "@/lib/medal/server";

const PIN_KEY = "por-benjeng-admin-pin";

type Tab = "medali" | "kontingen" | "header" | "tampilan" | "data";

const TABS: { id: Tab; label: string }[] = [
  { id: "medali", label: "Medali" },
  { id: "kontingen", label: "Kontingen" },
  { id: "header", label: "Header" },
  { id: "tampilan", label: "Tampilan" },
  { id: "data", label: "Data" },
];

type ConfirmState = {
  title: string;
  body: string;
  label: string;
  danger?: boolean;
};

export function AdminDashboard({ initial }: { initial: Board }) {
  const [gate, setGate] = useState<"checking" | "in" | "out">("checking");
  const [pin, setPin] = useState("");
  const [draftPin, setDraftPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [busyLogin, setBusyLogin] = useState(false);
  const [board, setBoard] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [tab, setTab] = useState<Tab>("medali");
  const [status, setStatus] = useState<"saved" | "saving" | "error">("saved");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<"rank" | "name">("rank");
  const [newName, setNewName] = useState("");
  const [nextPin, setNextPin] = useState("");
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const confirmRun = useRef<(() => void) | null>(null);
  const latest = useRef(initial);
  const savedRef = useRef(initial);
  const pinRef = useRef("");
  const running = useRef(false);
  const statusOk = useRef(true);
  const debounce = useRef(0);

  useEffect(() => {
    pinRef.current = pin;
  }, [pin]);

  useEffect(() => {
    const stored = sessionStorage.getItem(PIN_KEY);
    if (!stored) {
      setGate("out");
      return;
    }
    verifyPin({ data: { pin: stored } })
      .then(() => {
        pinRef.current = stored;
        setPin(stored);
        setGate("in");
      })
      .catch(() => {
        sessionStorage.removeItem(PIN_KEY);
        setGate("out");
      });
  }, []);

  useEffect(() => {
    if (!confirm) return;
    const onKey = (event: KeyboardEvent) => {
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
        const result = await saveBoard({
          data: {
            pin: pinRef.current,
            settings: toSettingsInput(snap.settings),
            contingents: snap.contingents.map(toContingentInput),
          },
        });
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
      if (statusOk.current && viewKey(latest.current) !== viewKey(savedRef.current) && pinRef.current) {
        void drain();
      }
    }
  }

  function edit(recipe: (current: Board) => Board, when: "now" | "soon" = "soon") {
    const next = recipe(latest.current);
    latest.current = next;
    setBoard(next);
    if (when === "now") {
      window.clearTimeout(debounce.current);
      void drain();
    } else {
      window.clearTimeout(debounce.current);
      debounce.current = window.setTimeout(() => void drain(), 500);
    }
  }

  function ask(state: ConfirmState, run: () => void) {
    confirmRun.current = run;
    setConfirm(state);
  }

  async function onLogin(event: FormEvent) {
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

  function patchTeam(id: string, recipe: (row: Contingent) => Contingent, when: "now" | "soon" = "now") {
    edit(
      (current) => ({
        ...current,
        contingents: current.contingents.map((row) => (row.id === id ? recipe(row) : row)),
      }),
      when,
    );
  }

  async function onPickImage(
    file: File | undefined,
    apply: (dataUrl: string) => void,
    maxEdge: number,
    limit: number,
  ) {
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, maxEdge, maxEdge > 600 ? 0.68 : 0.82, limit);
      apply(dataUrl);
    } catch (reason) {
      toast.error(errorText(reason));
    }
  }

  function addTeam(event: FormEvent) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    if (latest.current.contingents.some((row) => normName(row.name) === normName(name))) {
      toast.error("Nama kontingen sudah ada.");
      return;
    }
    const row: Contingent = {
      id: newId(),
      name,
      logo: "",
      gold: 0,
      silver: 0,
      bronze: 0,
      updatedAt: new Date().toISOString(),
    };
    edit((current) => ({ ...current, contingents: [...current.contingents, row] }), "now");
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

  async function onImport(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      const merged = applyImport(latest.current.contingents, rows);
      edit((current) => ({ ...current, contingents: merged }), "now");
      toast("Data CSV siap disimpan");
    } catch (reason) {
      toast.error(errorText(reason));
    }
  }

  async function onChangePin(event: FormEvent) {
    event.preventDefault();
    try {
      const result = await changePin({ data: { pin: pinRef.current, nextPin } });
      sessionStorage.setItem(PIN_KEY, nextPin);
      pinRef.current = nextPin;
      setPin(nextPin);
      setNextPin("");
      setBoard((current) => {
        const next = { ...current, settings: { ...current.settings, pinIsDefault: result.pinIsDefault } };
        latest.current = { ...latest.current, settings: next.settings };
        return next;
      });
      toast("PIN panitia diperbarui");
    } catch (reason) {
      toast.error(errorText(reason));
    }
  }

  if (gate !== "in") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-navy-950 px-4 py-10 text-ink">
        <form onSubmit={onLogin} className="w-full max-w-md rounded-2xl bg-ink p-6 text-navy-950">
          <p className="text-xs font-semibold tracking-widest text-gold-ink">POR SD BENJENG 2026</p>
          <h1 className="mt-1 font-display text-4xl leading-none">Login admin</h1>
          <p className="mt-2 text-sm text-navy-950/75">
            Khusus panitia. Perubahan medali akan tampil di papan klasemen.
          </p>
          {gate === "checking" ? <p className="mt-4 text-sm">Memeriksa akses panitia…</p> : null}
          {gate === "out" ? (
            <>
              {initial.settings.pinIsDefault ? (
                <p className="mt-4 rounded-lg bg-gold/25 px-3 py-2 text-sm">
                  PIN awal: <strong>{DEFAULT_PIN}</strong>. Ganti setelah masuk.
                </p>
              ) : (
                <p className="mt-4 text-sm">Masukkan PIN panitia yang sudah diatur.</p>
              )}
              <label className="mt-4 block text-sm font-semibold" htmlFor="pin">
                PIN panitia
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="pin"
                  name="pin"
                  autoComplete="current-password"
                  type={showPin ? "text" : "password"}
                  value={draftPin}
                  onChange={(event) => setDraftPin(event.target.value)}
                  className="h-11 w-full rounded-lg border border-navy-900/20 bg-field px-3 text-navy-950"
                />
                <button
                  type="button"
                  className="press h-11 shrink-0 rounded-lg border border-navy-900/20 px-3 text-sm"
                  onClick={() => setShowPin((value) => !value)}
                >
                  {showPin ? "Sembunyi" : "Lihat"}
                </button>
              </div>
              {loginError ? <p className="mt-2 text-sm text-accent">{loginError}</p> : null}
              <button
                type="submit"
                disabled={busyLogin || draftPin.trim().length < 4}
                className="press mt-4 h-11 w-full rounded-lg bg-gold font-semibold text-gold-ink disabled:opacity-50"
              >
                {busyLogin ? "Memeriksa…" : "Masuk"}
              </button>
            </>
          ) : null}
          <Link to="/" className="mt-4 inline-flex h-11 items-center text-sm font-semibold text-navy-800">
            Kembali ke papan klasemen
          </Link>
        </form>
      </main>
    );
  }

  const ranked = rankContingents(board.contingents);
  const shown = ranked
    .filter((row) => normName(row.name).includes(normName(query)))
    .sort((a, b) => (sortMode === "name" ? a.name.localeCompare(b.name, "id") : a.rank - b.rank || a.name.localeCompare(b.name, "id")));
  const sum = totals(board.contingents);
  const dirty = viewKey(board) !== viewKey(saved);
  const statusLabel =
    status === "saving"
      ? "Menyimpan…"
      : status === "error"
        ? error
        : dirty
          ? "Menyimpan perubahan…"
          : `Tersimpan · ${formatWib(latestStamp(saved))}`;

  return (
    <div className="min-h-dvh bg-navy-950 text-ink">
      <header className="border-b border-ink/15 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gold">PANEL PANITIA</p>
            <h1 className="font-display text-3xl leading-none">Live medal standing</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="press inline-flex h-11 items-center rounded-full border border-ink/25 px-4 text-sm">
              Lihat papan
            </Link>
            <button type="button" className="press inline-flex h-11 items-center gap-2 rounded-full border border-ink/25 px-4 text-sm" onClick={logout}>
              <LogOut className="size-4" aria-hidden="true" />
              Keluar
            </button>
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={
                item.id === tab
                  ? "h-11 shrink-0 rounded-full bg-gold px-4 text-sm font-semibold text-gold-ink"
                  : "h-11 shrink-0 rounded-full border border-ink/20 px-4 text-sm"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-4 pb-28">
        {tab === "medali" ? (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl">Input medali</h2>
                <p className="text-sm text-ink/70">
                  {sum.teams} kontingen · {sum.gold} emas · {sum.silver} perak · {sum.bronze} perunggu · total {sum.all}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className={sortMode === "rank" ? "h-10 rounded-full bg-ink px-3 text-sm font-semibold text-navy-950" : "h-10 rounded-full border border-ink/25 px-3 text-sm"} onClick={() => setSortMode("rank")}>
                  Peringkat
                </button>
                <button type="button" className={sortMode === "name" ? "h-10 rounded-full bg-ink px-3 text-sm font-semibold text-navy-950" : "h-10 rounded-full border border-ink/25 px-3 text-sm"} onClick={() => setSortMode("name")}>
                  Nama
                </button>
              </div>
            </div>
            <label className="mt-3 block text-sm" htmlFor="cari">
              Cari kontingen
            </label>
            <input
              id="cari"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contoh: 100 atau Muhammadiyah"
              className="mt-1 h-11 w-full rounded-lg border border-ink/20 bg-ink px-3 text-navy-950"
            />
            <div className="mt-3 flex flex-col gap-2">
              {shown.length === 0 ? <p className="text-sm text-ink/70">Tidak ada kontingen dengan kata itu.</p> : null}
              {shown.map((row) => (
                <article key={row.id} className="rounded-xl bg-ink p-3 text-navy-950">
                  <div className="flex items-center gap-2">
                    <TeamMark name={row.name} src={row.logo} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{row.name}</p>
                      <p className="text-xs text-navy-950/60">Peringkat {row.rank} · total {row.total}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <MedalStepper
                      label="Emas"
                      value={row.gold}
                      tone="gold"
                      onChange={(value, when) => patchTeam(row.id, (item) => ({ ...item, gold: value }), when)}
                    />
                    <MedalStepper
                      label="Perak"
                      value={row.silver}
                      tone="silver"
                      onChange={(value, when) => patchTeam(row.id, (item) => ({ ...item, silver: value }), when)}
                    />
                    <MedalStepper
                      label="Perunggu"
                      value={row.bronze}
                      tone="bronze"
                      onChange={(value, when) => patchTeam(row.id, (item) => ({ ...item, bronze: value }), when)}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "kontingen" ? (
          <section>
            <h2 className="font-display text-2xl">Kontingen</h2>
            <form onSubmit={addTeam} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="baru">Nama kontingen baru</label>
              <input
                id="baru"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Nama kontingen baru"
                className="h-11 w-full rounded-lg border border-ink/20 bg-ink px-3 text-navy-950"
              />
              <button type="submit" className="press h-11 shrink-0 rounded-lg bg-gold px-4 font-semibold text-gold-ink">
                Tambah
              </button>
            </form>
            <div className="mt-3 flex flex-col gap-2">
              {[...board.contingents]
                .sort((a, b) => a.name.localeCompare(b.name, "id"))
                .map((row) => (
                  <article key={row.id} className="rounded-xl bg-ink p-3 text-navy-950">
                    <div className="flex flex-wrap items-center gap-2">
                      <TeamMark name={row.name} src={row.logo} />
                      <label className="sr-only" htmlFor={`nama-${row.id}`}>Nama {row.name}</label>
                      <input
                        id={`nama-${row.id}`}
                        value={row.name}
                        onChange={(event) => patchTeam(row.id, (item) => ({ ...item, name: event.target.value }), "soon")}
                        className="h-11 min-w-0 flex-1 rounded-lg border border-navy-900/15 bg-field px-3"
                      />
                      <label className="press inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-navy-900/15 px-3 text-sm">
                        <ImagePlus className="size-4" aria-hidden="true" />
                        Logo
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            void onPickImage(file, (logo) => patchTeam(row.id, (item) => ({ ...item, logo }), "now"), 160, 80_000);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      {row.logo ? (
                        <button type="button" className="h-11 rounded-lg border border-navy-900/15 px-3 text-sm" onClick={() => patchTeam(row.id, (item) => ({ ...item, logo: "" }), "now")}>
                          Hapus logo
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="press inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-ink"
                        onClick={() =>
                          ask(
                            {
                              title: "Hapus kontingen?",
                              body: `${row.name} dan seluruh medalinya akan dihapus dari klasemen.`,
                              label: "Hapus",
                              danger: true,
                            },
                            () => edit((current) => ({ ...current, contingents: current.contingents.filter((item) => item.id !== row.id) }), "now"),
                          )
                        }
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        Hapus
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ) : null}

        {tab === "header" ? (
          <section className="rounded-2xl bg-ink p-4 text-navy-950">
            <h2 className="font-display text-2xl">Header papan</h2>
            <Field label="Judul utama" value={board.settings.title} onChange={(title) => edit((current) => ({ ...current, settings: { ...current.settings, title } }))} />
            <Field label="Subjudul" value={board.settings.subtitle} onChange={(subtitle) => edit((current) => ({ ...current, settings: { ...current.settings, subtitle } }))} />
            <Field label="Tulisan tambahan" value={board.settings.tagline} onChange={(tagline) => edit((current) => ({ ...current, settings: { ...current.settings, tagline } }))} />
            <Field label="Informasi acara" value={board.settings.eventNote} onChange={(eventNote) => edit((current) => ({ ...current, settings: { ...current.settings, eventNote } }))} />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <LogoField
                label="Logo penyelenggara 1"
                src={board.settings.logo1}
                onPick={(file) => void onPickImage(file, (logo1) => edit((current) => ({ ...current, settings: { ...current.settings, logo1 } }), "now"), 360, 120_000)}
                onClear={() => edit((current) => ({ ...current, settings: { ...current.settings, logo1: "" } }), "now")}
              />
              <LogoField
                label="Logo penyelenggara 2"
                src={board.settings.logo2}
                onPick={(file) => void onPickImage(file, (logo2) => edit((current) => ({ ...current, settings: { ...current.settings, logo2 } }), "now"), 360, 120_000)}
                onClear={() => edit((current) => ({ ...current, settings: { ...current.settings, logo2: "" } }), "now")}
              />
              <LogoField
                label="Logo penyelenggara 3"
                src={board.settings.logo3}
                onPick={(file) => void onPickImage(file, (logo3) => edit((current) => ({ ...current, settings: { ...current.settings, logo3 } }), "now"), 360, 120_000)}
                onClear={() => edit((current) => ({ ...current, settings: { ...current.settings, logo3: "" } }), "now")}
              />
            </div>
          </section>
        ) : null}

        {tab === "tampilan" ? (
          <section className="rounded-2xl bg-ink p-4 text-navy-950">
            <h2 className="font-display text-2xl">Tampilan</h2>
            <p className="mt-1 text-sm text-navy-950/70">Gunakan latar gelap supaya nama dan angka tetap terbaca di proyektor.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ColorField label="Warna latar" value={board.settings.colorNavy} onChange={(colorNavy) => edit((current) => ({ ...current, settings: { ...current.settings, colorNavy } }))} />
              <ColorField label="Warna teks" value={board.settings.colorPaper} onChange={(colorPaper) => edit((current) => ({ ...current, settings: { ...current.settings, colorPaper } }))} />
              <ColorField label="Warna emas" value={board.settings.colorGold} onChange={(colorGold) => edit((current) => ({ ...current, settings: { ...current.settings, colorGold } }))} />
              <ColorField label="Warna aksen" value={board.settings.colorAccent} onChange={(colorAccent) => edit((current) => ({ ...current, settings: { ...current.settings, colorAccent } }))} />
            </div>
            <div
              className="mt-4 rounded-xl p-4"
              style={{ background: board.settings.colorNavy, color: board.settings.colorPaper }}
            >
              <p className="text-xs tracking-widest" style={{ color: board.settings.colorGold }}>PRATINJAU</p>
              <p className="font-display text-3xl">{board.settings.title}</p>
              <p className="font-display text-4xl" style={{ color: board.settings.colorGold }}>12</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <label className="press inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-navy-900/15 px-3 text-sm">
                <ImagePlus className="size-4" aria-hidden="true" />
                Unggah latar
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    void onPickImage(file, (background) => edit((current) => ({ ...current, settings: { ...current.settings, background } }), "now"), 1400, 280_000);
                    event.target.value = "";
                  }}
                />
              </label>
              {board.settings.background ? (
                <button type="button" className="h-11 rounded-lg border border-navy-900/15 px-3 text-sm" onClick={() => edit((current) => ({ ...current, settings: { ...current.settings, background: "" } }), "now")}>
                  Hapus latar
                </button>
              ) : null}
              <button
                type="button"
                className="h-11 rounded-lg border border-navy-900/15 px-3 text-sm"
                onClick={() =>
                  edit(
                    (current) => ({
                      ...current,
                      settings: {
                        ...current.settings,
                        colorNavy: DEFAULT_COPY.colorNavy,
                        colorGold: DEFAULT_COPY.colorGold,
                        colorAccent: DEFAULT_COPY.colorAccent,
                        colorPaper: DEFAULT_COPY.colorPaper,
                      },
                    }),
                    "now",
                  )
                }
              >
                Warna bawaan
              </button>
            </div>
            {board.settings.background ? (
              <img src={board.settings.background} alt="Pratinjau latar" className="mt-3 h-28 w-full rounded-xl object-cover" />
            ) : null}
          </section>
        ) : null}

        {tab === "data" ? (
          <section className="flex flex-col gap-3">
            <div className="rounded-2xl bg-ink p-4 text-navy-950">
              <h2 className="font-display text-2xl">Ekspor dan impor</h2>
              <p className="mt-1 text-sm text-navy-950/70">
                File CSV memakai titik koma agar langsung terbuka di Excel. Kolom: id, nama, emas, perak, perunggu. Logo tetap jika nama atau id sama.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="press inline-flex h-11 items-center gap-2 rounded-lg bg-navy-900 px-4 text-sm font-semibold text-ink"
                  onClick={() => downloadText("klasemen-por-benjeng-2026.csv", toCsv(board.contingents), "text/csv;charset=utf-8")}
                >
                  <Download className="size-4" aria-hidden="true" />
                  Ekspor CSV
                </button>
                <label className="press inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-navy-900/15 px-4 text-sm font-semibold">
                  <Upload className="size-4" aria-hidden="true" />
                  Impor CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      ask(
                        {
                          title: "Impor data CSV?",
                          body: "Daftar kontingen dan medali akan diganti sesuai file. Logo dipertahankan bila nama atau id sama.",
                          label: "Impor",
                          danger: true,
                        },
                        () => void onImport(file),
                      );
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
            <form onSubmit={onChangePin} className="rounded-2xl bg-ink p-4 text-navy-950">
              <h2 className="font-display text-2xl">Ganti PIN</h2>
              <label className="mt-3 block text-sm font-semibold" htmlFor="pin-baru">PIN baru</label>
              <input
                id="pin-baru"
                type="text"
                value={nextPin}
                onChange={(event) => setNextPin(event.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-navy-900/15 bg-field px-3"
              />
              <button type="submit" disabled={nextPin.trim().length < 4} className="press mt-3 h-11 rounded-lg bg-gold px-4 font-semibold text-gold-ink disabled:opacity-50">
                Simpan PIN
              </button>
            </form>
            <div className="rounded-2xl border border-accent/50 p-4">
              <h2 className="font-display text-2xl">Reset data</h2>
              <p className="mt-1 text-sm text-ink/75">
                Mengembalikan 28 kontingen awal, mengosongkan medali, serta judul dan tampilan bawaan. PIN tidak berubah.
              </p>
              <button
                type="button"
                className="press mt-3 inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-ink"
                onClick={() =>
                  ask(
                    {
                      title: "Reset seluruh data?",
                      body: "Semua medali, logo, dan perubahan tulisan akan hilang. Tindakan ini tidak bisa dibatalkan.",
                      label: "Reset data",
                      danger: true,
                    },
                    () => void onReset(),
                  )
                }
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Reset data
              </button>
            </div>
          </section>
        ) : null}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/15 bg-navy-950/95 px-4 py-3">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <p className={status === "error" ? "text-sm text-accent" : "text-sm text-ink/75"}>{statusLabel}</p>
          <button type="button" className="press inline-flex h-11 items-center gap-2 rounded-full bg-gold px-4 text-sm font-semibold text-gold-ink" onClick={() => void drain()}>
            <Save className="size-4" aria-hidden="true" />
            Simpan perubahan
          </button>
        </div>
      </div>

      {confirm ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-navy-950/70 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="w-full max-w-md rounded-2xl bg-ink p-5 text-navy-950">
            <h2 id="confirm-title" className="font-display text-3xl leading-none">{confirm.title}</h2>
            <p className="mt-2 text-sm text-navy-950/80">{confirm.body}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="h-11 rounded-lg border border-navy-900/15 px-4 text-sm" onClick={() => setConfirm(null)}>
                Batal
              </button>
              <button
                type="button"
                className={confirm.danger ? "press h-11 rounded-lg bg-accent px-4 text-sm font-semibold text-ink" : "press h-11 rounded-lg bg-gold px-4 text-sm font-semibold text-gold-ink"}
                onClick={() => {
                  const run = confirmRun.current;
                  setConfirm(null);
                  run?.();
                }}
              >
                {confirm.label}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="mt-3 block text-sm font-semibold" htmlFor={id}>
      {label}
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-navy-900/15 bg-field px-3 font-normal" />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = `warna-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-navy-900/15 px-3 py-2 text-sm font-semibold" htmlFor={id}>
      {label}
      <input id={id} type="color" value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#0c1b33"} onChange={(event) => onChange(event.target.value)} className="h-11 w-14 cursor-pointer bg-transparent" />
    </label>
  );
}

function LogoField({
  label,
  src,
  onPick,
  onClear,
}: {
  label: string;
  src: string;
  onPick: (file: File | undefined) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-xl border border-navy-900/15 p-3">
      <p className="text-sm font-semibold">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        {src ? <img src={src} alt="" className="h-14 w-14 rounded-full object-cover" /> : <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900/10 text-xs">Kosong</span>}
        <label className="press inline-flex h-11 cursor-pointer items-center rounded-lg border border-navy-900/15 px-3 text-sm">
          Unggah
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
              onPick(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      {src ? (
        <button type="button" className="mt-2 text-sm underline" onClick={onClear}>
          Hapus logo
        </button>
      ) : null}
    </div>
  );
}

function MedalStepper({
  label,
  value,
  tone,
  onChange,
}: {
  label: string;
  value: number;
  tone: "gold" | "silver" | "bronze";
  onChange: (value: number, when: "now" | "soon") => void;
}) {
  const ring = tone === "gold" ? "bg-gold text-gold-ink" : "border border-navy-900/20";
  return (
    <div className="rounded-lg border border-navy-900/10 p-2">
      <p className="text-xs font-semibold tracking-wide text-navy-950/60">{label}</p>
      <div className="mt-1 flex items-center gap-1">
        <button type="button" aria-label={`Kurangi ${label}`} disabled={value <= 0} className="press inline-flex h-11 w-11 items-center justify-center rounded-lg border border-navy-900/15 disabled:opacity-40" onClick={() => onChange(clampMedal(value - 1), "now")}>
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <input
          aria-label={`Jumlah ${label}`}
          inputMode="numeric"
          value={String(value)}
          onFocus={(event) => event.target.select()}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 3);
            onChange(digits === "" ? 0 : clampMedal(Number(digits)), "soon");
          }}
          className="h-11 w-full rounded-lg bg-field text-center font-display text-2xl tabular-nums"
        />
        <button type="button" aria-label={`Tambah ${label}`} className={`press inline-flex h-11 w-11 items-center justify-center rounded-lg ${ring}`} onClick={() => onChange(clampMedal(value + 1), "now")}>
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
