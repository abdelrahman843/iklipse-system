"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, Archive, ArrowRight, SquareKanban, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { listBoards, createBoard, archiveBoard, isBoardSuperuser, type Board } from "@/lib/boards";

const ORANGE = "#F95338";
const COLORS = ["#f95338", "#f95338", "#f95338", "#f95338", "#f95338", "#f95338", "#f95338", "#64748b"];

export default function BoardsPage() {
  const { ready, currentUser } = useAuth();
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const canCreate = isBoardSuperuser(currentUser?.role);

  const load = useCallback(async () => {
    try {
      setBoards(await listBoards());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load boards.");
      setBoards([]);
    }
  }, []);

  useEffect(() => {
    if (ready && currentUser) load();
  }, [ready, currentUser, load]);

  const onArchive = async (id: string) => {
    setBoards((b) => b?.filter((x) => x.id !== id) ?? null);
    try {
      await archiveBoard(id);
    } catch {
      load(); // revert by reloading on failure
    }
  };

  return (
    <>
      <PageHeader
        title="Boards"
        subtitle="Plan and track work the Trello way — boards, lists and cards, scoped to your role."
        action={
          canCreate ? (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
              style={{ background: ORANGE, boxShadow: "0 8px 24px -8px rgba(249,83,56,0.8)" }}
            >
              <Plus className="size-4" /> New board
            </button>
          ) : null
        }
      />

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-sla-red/30 bg-sla-red/10 p-3 text-[0.8rem] text-sla-red">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
        </div>
      )}

      {boards === null ? (
        <div className="grid min-h-[40vh] place-items-center">
          <span className="flex items-center gap-3 text-sm text-faint">
            <Loader2 className="size-4 animate-spin" /> Loading boards…
          </span>
        </div>
      ) : boards.length === 0 ? (
        <Reveal>
          <GlassCard className="flex flex-col items-center p-12 text-center">
            <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-white/5">
              <SquareKanban className="size-7 text-muted" />
            </span>
            <p className="font-display text-lg font-semibold text-ink">No boards yet</p>
            <p className="mt-1.5 max-w-sm text-sm text-muted">
              {canCreate
                ? "Create your first board to start organizing work into lists and cards."
                : "You haven't been added to any boards yet. An admin can share one with you."}
            </p>
            {canCreate && (
              <button
                onClick={() => setCreating(true)}
                className="mt-5 flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
                style={{ background: ORANGE }}
              >
                <Plus className="size-4" /> New board
              </button>
            )}
          </GlassCard>
        </Reveal>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((b, i) => (
            <Reveal key={b.id} delay={i * 0.04}>
              <div className="group relative">
                <Link href={`/boards/${b.id}`}>
                  <GlassCard hover className="h-36 overflow-hidden p-0">
                    <div className="h-1.5 w-full" style={{ background: b.color ?? "#f95338" }} />
                    <div className="flex h-[calc(100%-0.375rem)] flex-col p-5">
                      <p className="font-display text-base font-semibold text-ink line-clamp-1">{b.title}</p>
                      <p className="mt-1 flex-1 text-sm text-muted line-clamp-2">
                        {b.description || "No description"}
                      </p>
                      <span className="flex items-center gap-1 text-[0.72rem] text-accent-soft opacity-0 transition-opacity group-hover:opacity-100">
                        Open board <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </GlassCard>
                </Link>
                {canCreate && (
                  <button
                    onClick={() => onArchive(b.id)}
                    title="Archive board"
                    className="absolute right-3 top-3 grid size-7 place-items-center rounded-lg bg-black/30 text-faint opacity-0 backdrop-blur transition-all hover:text-sla-red group-hover:opacity-100"
                  >
                    <Archive className="size-3.5" />
                  </button>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      )}

      <AnimatePresence>
        {creating && (
          <CreateBoardModal
            colors={COLORS}
            onClose={() => setCreating(false)}
            onCreated={(b) => {
              setBoards((list) => [b, ...(list ?? [])]);
              setCreating(false);
            }}
            createdBy={currentUser!.id}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function CreateBoardModal({
  colors,
  onClose,
  onCreated,
  createdBy,
}: {
  colors: string[];
  onClose: () => void;
  onCreated: (b: Board) => void;
  createdBy: string;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setErr("Give the board a name.");
    setBusy(true);
    setErr(null);
    try {
      const board = await createBoard({ title, description, color, createdBy });
      onCreated(board);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not create the board.");
      setBusy(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#101014] p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-lg font-semibold text-ink">New board</p>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-faint hover:bg-white/5 hover:text-ink">
            <X className="size-4" />
          </button>
        </div>

        {err && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-sla-red/30 bg-sla-red/10 p-3 text-[0.78rem] text-sla-red">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErr(null); }}
            placeholder="Board name"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-white/25"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-white/25"
          />
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-faint">Color</span>
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="size-6 rounded-full transition-transform hover:scale-110"
                style={{ background: c, boxShadow: color === c ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : "none" }}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
            style={{ background: ORANGE }}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {busy ? "Creating…" : "Create board"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
