import { flushSync } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  medalDeltas,
  rankContingents,
  rankMoves,
  viewKey,
  type Board,
} from "@/lib/medal/model";
import { getBoard } from "@/lib/medal/server";

type ViewDoc = Document & { startViewTransition?: (callback: () => void) => void };

export function useLiveBoard(initial: Board) {
  const [board, setBoard] = useState(initial);
  const [link, setLink] = useState<"live" | "offline">("live");
  const [flash, setFlash] = useState<Record<string, number>>({});
  const [moves, setMoves] = useState<Record<string, number>>({});
  const [announce, setAnnounce] = useState("");
  const prev = useRef(initial);
  const token = useRef(0);

  useEffect(() => {
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
        const flashMap: Record<string, number> = {};
        if (changes.ids.length || Object.keys(moveMap).length) {
          token.current += 1;
          for (const id of new Set([...changes.ids, ...Object.keys(moveMap)])) {
            flashMap[id] = token.current;
          }
        }
        const orderBefore = rankContingents(before.contingents).map((row) => row.id).join("|");
        const orderAfter = rankContingents(next.contingents).map((row) => row.id).join("|");
        prev.current = next;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const start = (document as ViewDoc).startViewTransition;
        if (orderBefore !== orderAfter && start && !reduce) {
          start(() => {
            flushSync(() => setBoard(next));
          });
        } else {
          setBoard(next);
        }
        setFlash(flashMap);
        setMoves(moveMap);
        setLink("live");
        if (changes.text) {
          setAnnounce(changes.text);
          toast("Perolehan medali berubah", { id: "medal-change", description: changes.text });
        }
        window.clearTimeout(clearFlash);
        clearFlash = window.setTimeout(() => {
          setFlash({});
          setMoves({});
        }, 4000);
      } catch {
        if (!cancel) setLink("offline");
      }
    }

    const interval = window.setInterval(() => void pull(), 4000);
    return () => {
      cancel = true;
      window.clearInterval(interval);
      window.clearTimeout(clearFlash);
    };
  }, []);

  return { board, link, flash, moves, announce };
}
