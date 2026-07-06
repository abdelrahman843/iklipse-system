"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Lock, AlertCircle, Settings, X, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { BoardCanvas } from "@/components/boards/BoardCanvas";
import { CardModal } from "@/components/boards/CardModal";
import { colorFor, nameOf, type Dir } from "@/components/boards/util";
import {
  getBoard, listLists, listCards, createList, createCard, nextPosition, isBoardSuperuser,
  listLabels, listCardLabels, listAssignees, getDirectory,
  listListMembers, addListMember, removeListMember, getAssignableStaff,
  updateList, deleteList, updateBoard, deleteBoard,
  type Board, type BoardList, type Card, type Label, type Profile, type ListMember,
} from "@/lib/boards";

const BOARD_COLORS = ["#f95338", "#f95338", "#f95338", "#f95338", "#f95338", "#f95338", "#f95338", "#64748b"];

export default function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const router = useRouter();
  const { ready, currentUser } = useAuth();

  const [board, setBoard] = useState<Board | null | undefined>(undefined);
  const [lists, setLists] = useState<BoardList[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [cardLabelRows, setCardLabelRows] = useState<{ card_id: string; label_id: string }[]>([]);
  const [assigneeRows, setAssigneeRows] = useState<{ card_id: string; user_id: string }[]>([]);
  const [listMemberRows, setListMemberRows] = useState<ListMember[]>([]);
  const [assignableStaff, setAssignableStaff] = useState<Profile[]>([]);
  const [dir, setDir] = useState<Dir>(new Map());
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = currentUser?.role;
  const isSuper = isBoardSuperuser(role);
  const isMember = role === "member";
  const canManage = isSuper;            // lists, board settings, list members
  const canWork = isSuper || isMember;  // add/move/edit cards
  const canComment = canWork;
  const canAdmin = isSuper;             // board settings + delete

  const reloadMeta = useCallback(async (cardIds: string[]) => {
    const [cl, asg] = await Promise.all([listCardLabels(cardIds), listAssignees(cardIds)]);
    setCardLabelRows(cl);
    setAssigneeRows(asg);
  }, []);

  const load = useCallback(async () => {
    try {
      const b = await getBoard(boardId);
      setBoard(b);
      if (!b) return;
      const [ls, cs, lbs, profs, staff] = await Promise.all([
        listLists(boardId), listCards(boardId), listLabels(boardId),
        getDirectory().catch(() => [] as Profile[]),       // non-fatal if RPC not installed
        getAssignableStaff().catch(() => [] as Profile[]),  // [] for non-superusers
      ]);
      const lm = await listListMembers(ls.map((l) => l.id)).catch(() => [] as ListMember[]);
      setLists(ls); setCards(cs); setLabels(lbs); setListMemberRows(lm); setAssignableStaff(staff);
      // directory + assignable staff both feed the id→profile map
      setDir(new Map([...profs, ...staff].map((p) => [p.id, p])));
      await reloadMeta(cs.map((c) => c.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load this board.");
      setBoard(null);
    }
  }, [boardId, reloadMeta]);

  useEffect(() => { if (ready && currentUser) load(); }, [ready, currentUser, load]);

  // refresh cards + badges after card edits
  const refreshCards = useCallback(async () => {
    const cs = await listCards(boardId);
    setCards(cs);
    await reloadMeta(cs.map((c) => c.id));
  }, [boardId, reloadMeta]);

  const labelsByCard = useMemo(() => {
    const lm = new Map(labels.map((l) => [l.id, l]));
    const out: Record<string, Label[]> = {};
    for (const row of cardLabelRows) {
      const l = lm.get(row.label_id);
      if (l) (out[row.card_id] ??= []).push(l);
    }
    return out;
  }, [cardLabelRows, labels]);

  const assigneesByCard = useMemo(() => {
    const out: Record<string, Profile[]> = {};
    for (const row of assigneeRows) {
      const p = dir.get(row.user_id);
      if (p) (out[row.card_id] ??= []).push(p);
    }
    return out;
  }, [assigneeRows, dir]);

  const listMembersByList = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const row of listMemberRows) (out[row.list_id] ??= []).push(row.user_id);
    return out;
  }, [listMemberRows]);

  const boardMemberIds = useMemo(() => [...new Set(listMemberRows.map((r) => r.user_id))], [listMemberRows]);

  const addListMemberH = async (listId: string, userId: string) => {
    setListMemberRows((p) => [...p, { list_id: listId, user_id: userId, added_at: new Date().toISOString() }]);
    await addListMember(listId, userId, currentUser!.id);
  };
  const removeListMemberH = async (listId: string, userId: string) => {
    setListMemberRows((p) => p.filter((r) => !(r.list_id === listId && r.user_id === userId)));
    await removeListMember(listId, userId);
  };

  const addList = async (title: string) => {
    const l = await createList(boardId, title, nextPosition(lists));
    setLists((p) => [...p, l]);
  };
  const addCard = async (listId: string, title: string) => {
    const inList = cards.filter((c) => c.list_id === listId);
    const c = await createCard(boardId, listId, title, nextPosition(inList), currentUser!.id);
    setCards((p) => [...p, c]);
  };
  const renameList = async (listId: string, title: string) => {
    setLists((p) => p.map((l) => (l.id === listId ? { ...l, title } : l)));
    await updateList(listId, title);
  };
  const removeList = async (listId: string) => {
    setLists((p) => p.filter((l) => l.id !== listId));
    setCards((p) => p.filter((c) => c.list_id !== listId));
    await deleteList(listId);
  };
  const onCardDeleted = (cardId: string) => {
    setCards((p) => p.filter((c) => c.id !== cardId));
    setOpenCard(null);
  };

  if (!ready || board === undefined) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <span className="flex items-center gap-3 text-sm text-faint"><Loader2 className="size-4 animate-spin" /> Loading board…</span>
      </div>
    );
  }

  if (board === null) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex max-w-sm flex-col items-center rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-8 text-center">
          <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-sla-red/10"><Lock className="size-6 text-sla-red" /></span>
          <p className="font-display text-lg font-semibold text-ink">Board not found</p>
          <p className="mt-1.5 text-sm text-muted">It may have been removed, or you don't have access to it.</p>
          <Link href="/boards" className="mt-5 flex items-center gap-2 text-sm text-accent-soft hover:text-accent"><ArrowLeft className="size-4" /> Back to boards</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href="/boards" className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-muted transition-colors hover:text-ink"><ArrowLeft className="size-4" /></Link>
        <span className="size-3 rounded-full" style={{ background: board.color ?? "#f95338", boxShadow: `0 0 12px ${board.color ?? "#f95338"}` }} />
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold tracking-tight text-ink line-clamp-1">{board.title}</h1>
          {board.description && <p className="text-sm text-muted line-clamp-1">{board.description}</p>}
        </div>
        <div className="ml-auto flex items-center gap-3">
          {boardMemberIds.length > 0 && (
            <div className="hidden -space-x-1.5 sm:flex">
              {boardMemberIds.slice(0, 5).map((id) => (
                <Avatar key={id} name={nameOf(dir, id)} color={colorFor(id)} size={28} src={dir.get(id)?.avatar_url ?? undefined} />
              ))}
            </div>
          )}
          {canAdmin && (
            <button onClick={() => setSettingsOpen(true)} title="Board settings" className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-muted transition-colors hover:text-ink">
              <Settings className="size-4" />
            </button>
          )}
          {isMember && (
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] text-faint">
              <Lock className="size-3" /> Member · your lists
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-sla-red/30 bg-sla-red/10 p-3 text-[0.8rem] text-sla-red">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
        </div>
      )}

      <BoardCanvas
        lists={lists} cards={cards} setCards={setCards} canManage={canManage} canWork={canWork}
        labelsByCard={labelsByCard} assigneesByCard={assigneesByCard}
        listMembersByList={listMembersByList} assignableStaff={assignableStaff} dir={dir}
        onOpenCard={setOpenCard} onAddCard={addCard} onAddList={addList}
        onRenameList={renameList} onDeleteList={removeList}
        onAddListMember={addListMemberH} onRemoveListMember={removeListMemberH}
      />

      <AnimatePresence>
        {openCard && (
          <CardModal
            cardId={openCard} boardId={boardId}
            canManage={canManage}
            canEditCard={canWork}
            canComment={canComment}
            labels={labels}
            memberIds={listMembersByList[cards.find((c) => c.id === openCard)?.list_id ?? ""] ?? []}
            dir={dir}
            onClose={() => { setOpenCard(null); refreshCards(); }}
            onChanged={refreshCards}
            onLabelsChanged={setLabels}
            onDeleted={onCardDeleted}
          />
        )}
        {settingsOpen && (
          <BoardSettingsModal
            board={board}
            onClose={() => setSettingsOpen(false)}
            onSaved={(patch) => { setBoard({ ...board, ...patch }); setSettingsOpen(false); }}
            onDeleted={async () => { await deleteBoard(board.id); router.push("/boards"); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BoardSettingsModal({
  board, onClose, onSaved, onDeleted,
}: {
  board: Board;
  onClose: () => void;
  onSaved: (patch: { title: string; description: string | null; color: string }) => void;
  onDeleted: () => Promise<void>;
}) {
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description ?? "");
  const [color, setColor] = useState(board.color ?? "#f95338");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setBusy(true);
    const patch = { title: title.trim(), description: description.trim() || null, color };
    try { await updateBoard(board.id, patch); onSaved(patch); } finally { setBusy(false); }
  };

  return (
    <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#101014] p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-lg font-semibold text-ink">Board settings</p>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-faint hover:bg-white/5 hover:text-ink"><X className="size-4" /></button>
        </div>
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Board name"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-ink outline-none focus:border-white/25" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink outline-none focus:border-white/25" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-faint">Color</span>
            {BOARD_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} className="size-6 rounded-full transition-transform hover:scale-110"
                style={{ background: c, boxShadow: color === c ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : "none" }} />
            ))}
          </div>
          <button onClick={save} disabled={busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-medium text-white disabled:opacity-60">
            {busy ? <Loader2 className="size-4 animate-spin" /> : null} Save changes
          </button>
          <div className="border-t border-white/8 pt-3">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button onClick={onDeleted} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-sla-red/15 text-sm font-medium text-sla-red">
                  <Trash2 className="size-4" /> Delete this board permanently
                </button>
                <button onClick={() => setConfirmDelete(false)} className="h-10 rounded-xl px-3 text-sm text-faint hover:text-ink">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-sm text-sla-red/80 hover:text-sla-red">
                <Trash2 className="size-4" /> Delete board
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
