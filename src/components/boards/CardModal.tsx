"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  X, Tag, Calendar, Users, CheckSquare, Paperclip, Link2, Trash2, Loader2,
  AlignLeft, Activity as ActivityIcon, Plus, Check, Download, MessageSquare,
} from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import {
  getCard, updateCard, listCardLabels, addCardLabel, removeCardLabel, createLabel, deleteLabel,
  listAssignees, addAssignee, removeAssignee, listChecklists, listChecklistItems, createChecklist,
  deleteChecklist, addChecklistItem, setChecklistItemDone, deleteChecklistItem, listComments,
  addComment, deleteComment, listAttachments, addLinkAttachment, addFileAttachment, attachmentUrl,
  deleteAttachment, listCardActivity, nextPosition, deleteCard,
  type Card, type Label, type Assignee, type Checklist, type ChecklistItem, type Comment,
  type Attachment, type Activity,
} from "@/lib/boards";
import { colorFor, nameOf, relTime, describeActivity, type Dir } from "./util";

const LABEL_COLORS = ["#f95338", "#f95338", "#f95338", "#f95338", "#f95338", "#f95338", "#f95338", "#64748b"];

export function CardModal({
  cardId, boardId, canManage, canEditCard, canComment, labels, memberIds, dir, onClose, onChanged, onLabelsChanged, onDeleted,
}: {
  cardId: string;
  boardId: string;
  canManage: boolean;   // superuser — board label palette
  canEditCard: boolean; // can fully edit this card (superuser, or member in their list)
  canComment: boolean;
  labels: Label[];
  memberIds: string[];  // assignee pool (this card's list members)
  dir: Dir;
  onClose: () => void;
  onChanged: () => void;
  onLabelsChanged: (labels: Label[]) => void;
  onDeleted: (cardId: string) => void;
}) {
  const { currentUser } = useAuth();
  const uid = currentUser!.id;

  const [card, setCard] = useState<Card | null>(null);
  const [cardLabels, setCardLabels] = useState<string[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const c = await getCard(cardId);
    setCard(c);
    if (!c) { setLoading(false); return; }
    const [cl, asg, chs, cms, atts, act] = await Promise.all([
      listCardLabels([cardId]), listAssignees([cardId]), listChecklists(cardId),
      listComments(cardId), listAttachments(cardId), listCardActivity(cardId),
    ]);
    setCardLabels(cl.map((x) => x.label_id));
    setAssignees(asg.map((x: Assignee) => x.user_id));
    setChecklists(chs);
    setItems(chs.length ? await listChecklistItems(chs.map((x) => x.id)) : []);
    setComments(cms);
    setAttachments(atts);
    setActivity(act);
    setLoading(false);
  }, [cardId]);

  useEffect(() => { loadAll(); }, [loadAll]);
  const refreshActivity = useCallback(async () => setActivity(await listCardActivity(cardId)), [cardId]);

  if (loading || !card) {
    return <Shell onClose={onClose}><div className="grid h-64 place-items-center text-faint"><Loader2 className="size-5 animate-spin" /></div></Shell>;
  }

  return (
    <Shell onClose={onClose}>
      <CardBody
        card={card} setCard={setCard} canManage={canManage} canEditCard={canEditCard} canComment={canComment}
        labels={labels} cardLabels={cardLabels} setCardLabels={setCardLabels}
        memberIds={memberIds} assignees={assignees} setAssignees={setAssignees}
        checklists={checklists} setChecklists={setChecklists} items={items} setItems={setItems}
        comments={comments} setComments={setComments} attachments={attachments} setAttachments={setAttachments}
        activity={activity} dir={dir} uid={uid} boardId={boardId} cardId={cardId}
        onChanged={onChanged} onLabelsChanged={onLabelsChanged} refreshActivity={refreshActivity} onDeleted={onDeleted}
      />
    </Shell>
  );
}

function Shell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[90] grid place-items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md sm:py-10"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0e0e12]"
      >
        <button onClick={onClose} className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-lg text-faint hover:bg-white/5 hover:text-ink">
          <X className="size-4" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

function CardBody(props: {
  card: Card; setCard: (c: Card) => void; canManage: boolean; canEditCard: boolean; canComment: boolean;
  labels: Label[]; cardLabels: string[]; setCardLabels: (f: (p: string[]) => string[]) => void;
  memberIds: string[]; assignees: string[]; setAssignees: (f: (p: string[]) => string[]) => void;
  checklists: Checklist[]; setChecklists: (f: (p: Checklist[]) => Checklist[]) => void;
  items: ChecklistItem[]; setItems: (f: (p: ChecklistItem[]) => ChecklistItem[]) => void;
  comments: Comment[]; setComments: (f: (p: Comment[]) => Comment[]) => void;
  attachments: Attachment[]; setAttachments: (f: (p: Attachment[]) => Attachment[]) => void;
  activity: Activity[]; dir: Dir; uid: string; boardId: string; cardId: string;
  onChanged: () => void; onLabelsChanged: (l: Label[]) => void; refreshActivity: () => void; onDeleted: (cardId: string) => void;
}) {
  const {
    card, setCard, canManage, canEditCard, canComment, labels, cardLabels, setCardLabels,
    memberIds, assignees, setAssignees, checklists, setChecklists, items, setItems, comments, setComments,
    attachments, setAttachments, activity, dir, uid, boardId, cardId, onChanged, onLabelsChanged, refreshActivity, onDeleted,
  } = props;

  const [title, setTitle] = useState(card.title);
  const [desc, setDesc] = useState(card.description ?? "");
  const [editingDesc, setEditingDesc] = useState(false);

  const saveTitle = async () => {
    const t = title.trim();
    if (!t || t === card.title) { setTitle(card.title); return; }
    await updateCard(cardId, { title: t }); setCard({ ...card, title: t }); onChanged(); refreshActivity();
  };
  const saveDesc = async () => {
    await updateCard(cardId, { description: desc.trim() || null });
    setCard({ ...card, description: desc.trim() || null }); setEditingDesc(false); onChanged(); refreshActivity();
  };
  const setDue = async (value: string) => {
    const iso = value ? new Date(value).toISOString() : null;
    await updateCard(cardId, { due_date: iso }); setCard({ ...card, due_date: iso }); onChanged(); refreshActivity();
  };

  const labelMap = new Map(labels.map((l) => [l.id, l]));

  return (
    <div className="max-h-[85vh] overflow-y-auto px-6 py-6">
      <div className="mb-5 pr-10">
        {canEditCard ? (
          <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            className="w-full rounded-lg bg-transparent font-display text-xl font-bold text-ink outline-none focus:bg-white/5 focus:px-2" />
        ) : (
          <h2 className="font-display text-xl font-bold text-ink">{card.title}</h2>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_220px]">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            {cardLabels.length > 0 && (
              <div>
                <p className="mb-1.5 text-[0.66rem] uppercase tracking-wider text-faint">Labels</p>
                <div className="flex flex-wrap gap-1.5">
                  {cardLabels.map((id) => {
                    const l = labelMap.get(id);
                    return l ? <span key={id} className="rounded-md px-2 py-1 text-[0.7rem] font-medium text-white" style={{ background: l.color }}>{l.name || "Label"}</span> : null;
                  })}
                </div>
              </div>
            )}
            {assignees.length > 0 && (
              <div>
                <p className="mb-1.5 text-[0.66rem] uppercase tracking-wider text-faint">Members</p>
                <div className="flex -space-x-1.5">
                  {assignees.map((id) => <Avatar key={id} name={nameOf(dir, id)} color={colorFor(id)} size={28} src={dir.get(id)?.avatar_url ?? undefined} />)}
                </div>
              </div>
            )}
            {card.due_date && (
              <div>
                <p className="mb-1.5 text-[0.66rem] uppercase tracking-wider text-faint">Due</p>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[0.74rem] text-ink">
                  <Calendar className="size-3.5 text-accent" />
                  {new Date(card.due_date).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            )}
          </div>

          <Section icon={AlignLeft} title="Description">
            {editingDesc && canEditCard ? (
              <div>
                <textarea autoFocus value={desc} onChange={(e) => setDesc(e.target.value)} rows={4}
                  className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-ink outline-none focus:border-white/25" placeholder="Add a more detailed description…" />
                <div className="mt-2 flex gap-2">
                  <button onClick={saveDesc} className="h-8 rounded-lg bg-accent px-3 text-xs font-medium text-white">Save</button>
                  <button onClick={() => { setDesc(card.description ?? ""); setEditingDesc(false); }} className="h-8 rounded-lg px-3 text-xs text-faint hover:text-ink">Cancel</button>
                </div>
              </div>
            ) : (
              <button disabled={!canEditCard} onClick={() => setEditingDesc(true)}
                className="block w-full rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 text-left text-sm text-muted enabled:hover:bg-white/5">
                {card.description || (canEditCard ? "Add a description…" : "No description")}
              </button>
            )}
          </Section>

          <Checklists cardId={cardId} canEdit={canEditCard} checklists={checklists} setChecklists={setChecklists} items={items} setItems={setItems} uid={uid} refreshActivity={refreshActivity} />
          <Attachments boardId={boardId} cardId={cardId} canEdit={canEditCard} attachments={attachments} setAttachments={setAttachments} uid={uid} refreshActivity={refreshActivity} />
          <Comments cardId={cardId} canComment={canComment} comments={comments} setComments={setComments} dir={dir} uid={uid} refreshActivity={refreshActivity} />

          <Section icon={ActivityIcon} title="Activity">
            <div className="space-y-2.5">
              {activity.length === 0 && <p className="text-sm text-faint">No activity yet.</p>}
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5 text-sm">
                  <Avatar name={nameOf(dir, a.actor_id)} color={colorFor(a.actor_id ?? "x")} size={24} src={a.actor_id ? dir.get(a.actor_id)?.avatar_url ?? undefined : undefined} />
                  <p className="text-muted"><span className="text-ink">{nameOf(dir, a.actor_id)}</span> {describeActivity(a, dir)}<span className="ml-1.5 text-[0.7rem] text-faint">{relTime(a.created_at)}</span></p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-2">
          <p className="text-[0.66rem] uppercase tracking-wider text-faint">Add to card</p>
          <LabelPicker cardId={cardId} canManage={canManage} canEditCard={canEditCard} labels={labels} labelMap={labelMap}
            cardLabels={cardLabels} setCardLabels={setCardLabels} boardId={boardId} onLabelsChanged={onLabelsChanged} onChanged={onChanged} refreshActivity={refreshActivity} />
          <MemberPicker cardId={cardId} canEdit={canEditCard} memberIds={memberIds} assignees={assignees} setAssignees={setAssignees} dir={dir} uid={uid} onChanged={onChanged} refreshActivity={refreshActivity} />
          {canEditCard && (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted hover:text-ink">
              <Calendar className="size-4" /> Due date
              <input type="datetime-local" defaultValue={card.due_date ? new Date(card.due_date).toISOString().slice(0, 16) : ""} onChange={(e) => setDue(e.target.value)} className="ml-auto w-0 opacity-0" />
            </label>
          )}
          {canEditCard && (
            <button onClick={async () => { if (!confirm("Delete this card? This cannot be undone.")) return; await deleteCard(cardId); onDeleted(cardId); }}
              className="mt-1 flex w-full items-center gap-2 rounded-lg border border-sla-red/20 bg-sla-red/5 px-3 py-2 text-sm text-sla-red/90 transition-colors hover:bg-sla-red/10">
              <Trash2 className="size-4" /> Delete card
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2"><Icon className="size-4 text-faint" /><p className="font-display text-sm font-semibold text-ink">{title}</p></div>
      {children}
    </div>
  );
}

function LabelPicker(props: {
  cardId: string; canManage: boolean; canEditCard: boolean; labels: Label[]; labelMap: Map<string, Label>;
  cardLabels: string[]; setCardLabels: (f: (p: string[]) => string[]) => void; boardId: string;
  onLabelsChanged: (l: Label[]) => void; onChanged: () => void; refreshActivity: () => void;
}) {
  const { cardId, canManage, canEditCard, labels, cardLabels, setCardLabels, boardId, onLabelsChanged, onChanged, refreshActivity } = props;
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(LABEL_COLORS[0]);
  const [local, setLocal] = useState(labels);
  useEffect(() => setLocal(labels), [labels]);

  const toggle = async (labelId: string) => {
    if (cardLabels.includes(labelId)) { setCardLabels((p) => p.filter((x) => x !== labelId)); await removeCardLabel(cardId, labelId); }
    else { setCardLabels((p) => [...p, labelId]); await addCardLabel(cardId, labelId); }
    onChanged(); refreshActivity();
  };
  const create = async () => { const l = await createLabel(boardId, newName, newColor); const next = [...local, l]; setLocal(next); onLabelsChanged(next); setNewName(""); };
  const remove = async (id: string) => { await deleteLabel(id); const next = local.filter((l) => l.id !== id); setLocal(next); onLabelsChanged(next); setCardLabels((p) => p.filter((x) => x !== id)); };

  if (!canEditCard) return null;

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted hover:text-ink"><Tag className="size-4" /> Labels</button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-60 rounded-xl border border-white/10 bg-[#141418] p-2.5 shadow-xl">
          <div className="space-y-1">
            {local.map((l) => (
              <div key={l.id} className="flex items-center gap-1.5">
                <button onClick={() => toggle(l.id)} className="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-white" style={{ background: l.color }}>
                  <span className="flex-1 truncate">{l.name || "Label"}</span>{cardLabels.includes(l.id) && <Check className="size-3.5" />}
                </button>
                {canManage && <button onClick={() => remove(l.id)} className="grid size-6 place-items-center rounded text-faint hover:text-sla-red"><Trash2 className="size-3.5" /></button>}
              </div>
            ))}
            {local.length === 0 && <p className="px-1 py-1 text-xs text-faint">No labels yet.</p>}
          </div>
          {canManage && (
            <div className="mt-2 border-t border-white/8 pt-2">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New label name" className="h-8 w-full rounded-md border border-white/10 bg-white/5 px-2 text-xs text-ink outline-none" />
              <div className="mt-1.5 flex items-center gap-1">
                {LABEL_COLORS.map((c) => <button key={c} onClick={() => setNewColor(c)} className="size-5 rounded" style={{ background: c, boxShadow: newColor === c ? "0 0 0 2px #fff" : "none" }} />)}
                <button onClick={create} className="ml-auto grid size-7 place-items-center rounded-md bg-accent text-white"><Plus className="size-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MemberPicker(props: {
  cardId: string; canEdit: boolean; memberIds: string[]; assignees: string[];
  setAssignees: (f: (p: string[]) => string[]) => void; dir: Dir; uid: string; onChanged: () => void; refreshActivity: () => void;
}) {
  const { cardId, canEdit, memberIds, assignees, setAssignees, dir, uid, onChanged, refreshActivity } = props;
  const [open, setOpen] = useState(false);
  if (!canEdit) return null;

  const toggle = async (userId: string) => {
    if (assignees.includes(userId)) { setAssignees((p) => p.filter((x) => x !== userId)); await removeAssignee(cardId, userId); }
    else { setAssignees((p) => [...p, userId]); await addAssignee(cardId, userId, uid); }
    onChanged(); refreshActivity();
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted hover:text-ink"><Users className="size-4" /> Members</button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-60 rounded-xl border border-white/10 bg-[#141418] p-2 shadow-xl">
          {memberIds.map((id) => (
            <button key={id} onClick={() => toggle(id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-muted hover:bg-white/5 hover:text-ink">
              <Avatar name={nameOf(dir, id)} color={colorFor(id)} size={24} src={dir.get(id)?.avatar_url ?? undefined} />
              <span className="flex-1 truncate">{nameOf(dir, id)}</span>{assignees.includes(id) && <Check className="size-4 text-sla-green" />}
            </button>
          ))}
          {memberIds.length === 0 && <p className="px-2 py-1 text-xs text-faint">No one is assigned to this list yet.</p>}
        </div>
      )}
    </div>
  );
}

function Checklists(props: {
  cardId: string; canEdit: boolean; checklists: Checklist[]; setChecklists: (f: (p: Checklist[]) => Checklist[]) => void;
  items: ChecklistItem[]; setItems: (f: (p: ChecklistItem[]) => ChecklistItem[]) => void; uid: string; refreshActivity: () => void;
}) {
  const { cardId, canEdit, checklists, setChecklists, items, setItems, uid, refreshActivity } = props;
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const addList = async () => {
    if (!title.trim()) return;
    const cl = await createChecklist(cardId, title, nextPosition(checklists));
    setChecklists((p) => [...p, cl]); setTitle(""); setAdding(false);
  };

  return (
    <Section icon={CheckSquare} title="Checklists">
      <div className="space-y-4">
        {checklists.map((cl) => {
          const its = items.filter((i) => i.checklist_id === cl.id).sort((a, b) => a.position - b.position);
          const done = its.filter((i) => i.is_done).length;
          const pct = its.length ? Math.round((done / its.length) * 100) : 0;
          return (
            <div key={cl.id}>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-sm font-medium text-ink">{cl.title}</p>
                {canEdit && <button onClick={async () => { await deleteChecklist(cl.id); setChecklists((p) => p.filter((x) => x.id !== cl.id)); setItems((p) => p.filter((i) => i.checklist_id !== cl.id)); }} className="text-faint hover:text-sla-red"><Trash2 className="size-3.5" /></button>}
              </div>
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-sla-green transition-all" style={{ width: `${pct}%` }} /></div>
              <div className="space-y-1">
                {its.map((it) => (
                  <div key={it.id} className="group flex items-center gap-2">
                    <button disabled={!canEdit} onClick={async () => { const nd = !it.is_done; setItems((p) => p.map((x) => x.id === it.id ? { ...x, is_done: nd } : x)); await setChecklistItemDone(it.id, nd, uid); refreshActivity(); }}
                      className={`grid size-4 shrink-0 place-items-center rounded border ${it.is_done ? "border-sla-green bg-sla-green" : "border-white/25"}`}>
                      {it.is_done && <Check className="size-3 text-black" />}
                    </button>
                    <span className={`flex-1 text-sm ${it.is_done ? "text-faint line-through" : "text-muted"}`}>{it.content}</span>
                    {canEdit && <button onClick={async () => { await deleteChecklistItem(it.id); setItems((p) => p.filter((x) => x.id !== it.id)); }} className="text-faint opacity-0 group-hover:opacity-100 hover:text-sla-red"><X className="size-3.5" /></button>}
                  </div>
                ))}
              </div>
              {canEdit && <AddItem checklistId={cl.id} items={its} setItems={setItems} />}
            </div>
          );
        })}
        {canEdit && (adding ? (
          <div className="flex gap-2">
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addList(); if (e.key === "Escape") setAdding(false); }} placeholder="Checklist title" className="h-9 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-ink outline-none" />
            <button onClick={addList} className="h-9 rounded-lg bg-accent px-3 text-xs font-medium text-white">Add</button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-sm text-muted hover:text-ink"><Plus className="size-4" /> Add checklist</button>
        ))}
      </div>
    </Section>
  );
}

function AddItem({ checklistId, items, setItems }: { checklistId: string; items: ChecklistItem[]; setItems: (f: (p: ChecklistItem[]) => ChecklistItem[]) => void }) {
  const [text, setText] = useState("");
  const add = async () => { if (!text.trim()) return; const it = await addChecklistItem(checklistId, text, nextPosition(items)); setItems((p) => [...p, it]); setText(""); };
  return (
    <div className="mt-1.5 flex gap-2">
      <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="Add an item…" className="h-8 flex-1 rounded-md border border-white/8 bg-white/5 px-2.5 text-sm text-ink outline-none" />
      <button onClick={add} className="grid size-8 place-items-center rounded-md bg-white/5 text-muted hover:text-ink"><Plus className="size-4" /></button>
    </div>
  );
}

function Attachments(props: {
  boardId: string; cardId: string; canEdit: boolean; attachments: Attachment[];
  setAttachments: (f: (p: Attachment[]) => Attachment[]) => void; uid: string; refreshActivity: () => void;
}) {
  const { boardId, cardId, canEdit, attachments, setAttachments, uid, refreshActivity } = props;
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { const a = await addFileAttachment(boardId, cardId, file, uid); setAttachments((p) => [a, ...p]); refreshActivity(); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };
  const addLink = async () => {
    if (!linkUrl.trim()) return;
    const a = await addLinkAttachment(cardId, linkName || linkUrl, linkUrl, uid);
    setAttachments((p) => [a, ...p]); setLinkUrl(""); setLinkName(""); setLinkMode(false); refreshActivity();
  };
  const open = async (a: Attachment) => { const url = await attachmentUrl(a); if (url) window.open(url, "_blank", "noopener"); };
  const remove = async (a: Attachment) => { await deleteAttachment(a); setAttachments((p) => p.filter((x) => x.id !== a.id)); };

  return (
    <Section icon={Paperclip} title="Attachments">
      <div className="space-y-2">
        {attachments.map((a) => (
          <div key={a.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/5 text-faint">{a.kind === "link" ? <Link2 className="size-4" /> : <Paperclip className="size-4" />}</span>
            <button onClick={() => open(a)} className="min-w-0 flex-1 text-left"><p className="truncate text-sm text-ink">{a.file_name}</p><p className="text-[0.68rem] text-faint">{a.kind === "link" ? "Link" : a.mime_type || "File"}</p></button>
            <button onClick={() => open(a)} className="grid size-8 place-items-center rounded-lg text-faint hover:text-ink"><Download className="size-4" /></button>
            {canEdit && <button onClick={() => remove(a)} className="grid size-8 place-items-center rounded-lg text-faint hover:text-sla-red"><Trash2 className="size-4" /></button>}
          </div>
        ))}
        {attachments.length === 0 && <p className="text-sm text-faint">No attachments.</p>}
        {canEdit && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <input ref={fileRef} type="file" hidden onChange={onFile} />
            <button onClick={() => fileRef.current?.click()} disabled={busy} className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-muted hover:text-ink disabled:opacity-60">{busy ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />} Upload file</button>
            <button onClick={() => setLinkMode((v) => !v)} className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-muted hover:text-ink"><Link2 className="size-4" /> Add link</button>
          </div>
        )}
        {linkMode && canEdit && (
          <div className="space-y-2 rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-ink outline-none" />
            <input value={linkName} onChange={(e) => setLinkName(e.target.value)} placeholder="Display name (optional)" className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-ink outline-none" />
            <button onClick={addLink} className="h-8 rounded-lg bg-accent px-3 text-xs font-medium text-white">Add link</button>
          </div>
        )}
      </div>
    </Section>
  );
}

function Comments(props: {
  cardId: string; canComment: boolean; comments: Comment[]; setComments: (f: (p: Comment[]) => Comment[]) => void;
  dir: Dir; uid: string; refreshActivity: () => void;
}) {
  const { cardId, canComment, comments, setComments, dir, uid, refreshActivity } = props;
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try { const c = await addComment(cardId, uid, text); setComments((p) => [...p, c]); setText(""); refreshActivity(); }
    finally { setBusy(false); }
  };

  return (
    <Section icon={MessageSquare} title="Comments">
      {canComment && (
        <div className="mb-3 flex gap-2">
          <Avatar name={nameOf(dir, uid)} color={colorFor(uid)} size={28} src={dir.get(uid)?.avatar_url ?? undefined} />
          <div className="flex-1">
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Write a comment…" className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink outline-none focus:border-white/25" />
            <button onClick={send} disabled={busy || !text.trim()} className="mt-1.5 h-8 rounded-lg bg-accent px-3 text-xs font-medium text-white disabled:opacity-50">{busy ? "Posting…" : "Comment"}</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <Avatar name={nameOf(dir, c.author_id)} color={colorFor(c.author_id)} size={28} src={dir.get(c.author_id)?.avatar_url ?? undefined} />
            <div className="min-w-0 flex-1">
              <p className="text-sm"><span className="text-ink">{nameOf(dir, c.author_id)}</span><span className="ml-1.5 text-[0.7rem] text-faint">{relTime(c.created_at)}</span></p>
              <p className="mt-0.5 whitespace-pre-wrap rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-muted">{c.body}</p>
              {c.author_id === uid && <button onClick={async () => { await deleteComment(c.id); setComments((p) => p.filter((x) => x.id !== c.id)); }} className="mt-1 text-[0.7rem] text-faint hover:text-sla-red">Delete</button>}
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-faint">No comments yet.</p>}
      </div>
    </Section>
  );
}
