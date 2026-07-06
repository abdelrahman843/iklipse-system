"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners,
  useDroppable, type DragStartEvent, type DragOverEvent, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, X, CalendarClock, CheckSquare, MoreHorizontal, Pencil, Trash2, UserPlus, Check } from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import { moveCard, midpoint, type BoardList, type Card, type Label, type Profile } from "@/lib/boards";
import { colorFor, nameOf, type Dir } from "./util";

type Props = {
  lists: BoardList[];
  cards: Card[];
  setCards: Dispatch<SetStateAction<Card[]>>;
  canManage: boolean; // superuser — manage lists, board, list members
  canWork: boolean;   // superuser or member — add/move/edit cards
  labelsByCard: Record<string, Label[]>;
  assigneesByCard: Record<string, Profile[]>;
  listMembersByList: Record<string, string[]>;
  assignableStaff: Profile[];
  dir: Dir;
  onOpenCard: (id: string) => void;
  onAddCard: (listId: string, title: string) => Promise<void>;
  onAddList: (title: string) => Promise<void>;
  onRenameList: (listId: string, title: string) => Promise<void>;
  onDeleteList: (listId: string) => Promise<void>;
  onAddListMember: (listId: string, userId: string) => Promise<void>;
  onRemoveListMember: (listId: string, userId: string) => Promise<void>;
};

export function BoardCanvas(props: Props) {
  const { lists, cards, setCards, canManage, onAddList } = props;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [newList, setNewList] = useState("");

  const cardsByList = useMemo(() => {
    const map: Record<string, Card[]> = {};
    for (const l of lists) map[l.id] = [];
    for (const c of cards) (map[c.list_id] ??= []).push(c);
    for (const k in map) map[k].sort((a, b) => a.position - b.position);
    return map;
  }, [lists, cards]);

  const listIdOf = (id: string): string | undefined =>
    lists.some((l) => l.id === id) ? id : cards.find((c) => c.id === id)?.list_id;

  const onDragOver = (e: DragOverEvent) => {
    const activeCardId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    if (!overId) return;
    const active = cards.find((c) => c.id === activeCardId);
    const overList = listIdOf(overId);
    if (!active || !overList || active.list_id === overList) return;
    setCards((prev) => prev.map((c) => (c.id === activeCardId ? { ...c, list_id: overList } : c)));
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const activeCardId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    if (!overId) return;
    const overList = listIdOf(overId) ?? cards.find((c) => c.id === activeCardId)?.list_id;
    if (!overList) return;

    const siblings = cards.filter((c) => c.list_id === overList && c.id !== activeCardId).sort((a, b) => a.position - b.position);
    const overIndex = lists.some((l) => l.id === overId) ? siblings.length : siblings.findIndex((c) => c.id === overId);
    const idx = overIndex < 0 ? siblings.length : overIndex;
    const pos = midpoint(siblings[idx - 1]?.position, siblings[idx]?.position);

    setCards((prev) => prev.map((c) => (c.id === activeCardId ? { ...c, list_id: overList, position: pos } : c)));
    try {
      await moveCard(activeCardId, overList, pos);
    } catch {
      /* RLS / network error — a board reload by the parent will reconcile */
    }
  };

  const activeCard = activeId ? cards.find((c) => c.id === activeId) ?? null : null;

  const addList = async () => {
    if (!newList.trim()) return;
    const t = newList.trim();
    setNewList(""); setAddingList(false);
    await onAddList(t);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-4">
        {lists.map((list) => (
          <ListColumn
            key={list.id} {...props} list={list} cards={cardsByList[list.id] ?? []}
          />
        ))}

        {canManage && (
          <div className="w-72 shrink-0">
            {addingList ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2.5">
                <input autoFocus value={newList} onChange={(e) => setNewList(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addList(); if (e.key === "Escape") { setAddingList(false); setNewList(""); } }}
                  placeholder="List title" className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-ink outline-none placeholder:text-faint focus:border-white/25" />
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={addList} className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-medium text-white"><Plus className="size-3.5" /> Add list</button>
                  <button onClick={() => { setAddingList(false); setNewList(""); }} className="grid size-8 place-items-center rounded-lg text-faint hover:bg-white/5 hover:text-ink"><X className="size-4" /></button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingList(true)} className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-white/12 bg-white/[0.015] px-4 py-3 text-sm text-muted transition-colors hover:border-white/25 hover:text-ink"><Plus className="size-4" /> Add a list</button>
            )}
          </div>
        )}

        {lists.length === 0 && !canManage && (
          <div className="grid w-full place-items-center text-sm text-faint">No lists are assigned to you on this board.</div>
        )}
      </div>

      <DragOverlay>
        {activeCard ? (
          <CardTile card={activeCard} labels={props.labelsByCard[activeCard.id] ?? []} assignees={props.assigneesByCard[activeCard.id] ?? []} dir={props.dir} dragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function ListColumn(props: Props & { list: BoardList; cards: Card[] }) {
  const {
    list, cards, canManage, canWork, labelsByCard, assigneesByCard, listMembersByList, assignableStaff, dir,
    onOpenCard, onAddCard, onRenameList, onDeleteList, onAddListMember, onRemoveListMember,
  } = props;
  const { setNodeRef } = useDroppable({ id: list.id });
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(list.title);
  const memberIds = listMembersByList[list.id] ?? [];

  const submit = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try { await onAddCard(list.id, text.trim()); setText(""); } finally { setBusy(false); }
  };

  const saveRename = async () => {
    const t = title.trim();
    setRenaming(false);
    if (!t || t === list.title) { setTitle(list.title); return; }
    await onRenameList(list.id, t);
  };

  return (
    <div className="flex max-h-full w-72 shrink-0 flex-col rounded-2xl border border-white/6 bg-white/[0.015]">
      <div className="flex items-center gap-2 px-3.5 py-3">
        {renaming && canManage ? (
          <input
            autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveRename}
            onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") { setRenaming(false); setTitle(list.title); } }}
            className="h-7 flex-1 rounded-md border border-white/15 bg-white/5 px-2 font-display text-sm font-semibold text-ink outline-none"
          />
        ) : (
          <p className="flex-1 font-display text-sm font-semibold text-ink line-clamp-1">{list.title}</p>
        )}
        {memberIds.length > 0 && (
          <div className="flex -space-x-1.5">
            {memberIds.slice(0, 3).map((id) => (
              <Avatar key={id} name={nameOf(dir, id)} color={colorFor(id)} size={20} src={dir.get(id)?.avatar_url ?? undefined} />
            ))}
          </div>
        )}
        <span className="tnum rounded-full bg-white/5 px-2 py-0.5 text-[0.64rem] text-faint">{cards.length}</span>
        {canManage && !renaming && (
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="grid size-6 place-items-center rounded text-faint hover:bg-white/5 hover:text-ink">
              <MoreHorizontal className="size-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#141418] py-1 shadow-xl">
                  <button onClick={() => { setMenuOpen(false); setRenaming(true); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted hover:bg-white/5 hover:text-ink">
                    <Pencil className="size-3.5" /> Rename
                  </button>
                  <button onClick={() => { setMenuOpen(false); setMembersOpen(true); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted hover:bg-white/5 hover:text-ink">
                    <UserPlus className="size-3.5" /> Members
                  </button>
                  <button
                    onClick={async () => { setMenuOpen(false); if (confirm(`Delete list "${list.title}" and all its cards?`)) await onDeleteList(list.id); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-sla-red/90 hover:bg-sla-red/10"
                  >
                    <Trash2 className="size-3.5" /> Delete list
                  </button>
                </div>
              </>
            )}
            {membersOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMembersOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 max-h-72 w-60 overflow-y-auto rounded-xl border border-white/10 bg-[#141418] p-2 shadow-xl">
                  <p className="px-2 py-1 text-[0.66rem] uppercase tracking-wider text-faint">Assign to “{list.title}”</p>
                  {assignableStaff.map((p) => {
                    const on = memberIds.includes(p.id);
                    return (
                      <button key={p.id}
                        onClick={() => (on ? onRemoveListMember(list.id, p.id) : onAddListMember(list.id, p.id))}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-muted hover:bg-white/5 hover:text-ink">
                        <Avatar name={nameOf(dir, p.id)} color={colorFor(p.id)} size={22} src={p.avatar_url ?? undefined} />
                        <span className="flex-1 truncate">{nameOf(dir, p.id)}</span>
                        {on && <Check className="size-4 text-sla-green" />}
                      </button>
                    );
                  })}
                  {assignableStaff.length === 0 && <p className="px-2 py-1 text-xs text-faint">No staff available.</p>}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div ref={setNodeRef} className="flex min-h-[8px] flex-1 flex-col gap-2 overflow-y-auto px-2.5 pb-2">
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((c) => (
            <SortableCard key={c.id} card={c} disabled={!canWork} onClick={() => onOpenCard(c.id)}>
              <CardTile card={c} labels={labelsByCard[c.id] ?? []} assignees={assigneesByCard[c.id] ?? []} dir={dir} />
            </SortableCard>
          ))}
        </SortableContext>
        {cards.length === 0 && !adding && <p className="px-1 py-3 text-center text-[0.72rem] text-faint">No cards</p>}
      </div>

      {canWork && (
        <div className="p-2.5 pt-1">
          {adding ? (
            <div>
              <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } if (e.key === "Escape") { setAdding(false); setText(""); } }}
                placeholder="Card title…" rows={2} className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-white/25" />
              <div className="mt-2 flex items-center gap-2">
                <button onClick={submit} disabled={busy} className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-medium text-white disabled:opacity-60"><Plus className="size-3.5" /> Add card</button>
                <button onClick={() => { setAdding(false); setText(""); }} className="grid size-8 place-items-center rounded-lg text-faint hover:bg-white/5 hover:text-ink"><X className="size-4" /></button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-ink"><Plus className="size-4" /> Add a card</button>
          )}
        </div>
      )}
    </div>
  );
}

function SortableCard({ card, disabled, onClick, children }: { card: Card; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id, disabled });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      {...attributes} {...listeners}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function CardTile({ card, labels, assignees, dir, dragging }: { card: Card; labels: Label[]; assignees: Profile[]; dir: Dir; dragging?: boolean }) {
  return (
    <div className={`glass ${dragging ? "rotate-2 shadow-2xl" : "glass-hover"} cursor-pointer p-3`}>
      {card.cover_color && <div className="mb-2 h-1.5 w-full rounded-full" style={{ background: card.cover_color }} />}
      {labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {labels.map((l) => (
            <span key={l.id} className="h-1.5 w-8 rounded-full" style={{ background: l.color }} title={l.name ?? undefined} />
          ))}
        </div>
      )}
      <p className="text-sm leading-snug text-ink">{card.title}</p>
      <div className="mt-2.5 flex items-center gap-3">
        {card.due_date && (
          <span className="flex items-center gap-1 text-[0.68rem] text-faint">
            <CalendarClock className="size-3" />
            {new Date(card.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        )}
        {card.description && <CheckSquare className="size-3 text-faint" />}
        <div className="ml-auto flex -space-x-1.5">
          {assignees.slice(0, 3).map((p) => (
            <Avatar key={p.id} name={p.full_name || p.username || "M"} color={colorFor(p.id)} size={22} src={p.avatar_url ?? undefined} />
          ))}
        </div>
      </div>
    </div>
  );
}
