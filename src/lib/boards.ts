"use client";

import { getSupabase } from "@/lib/supabase/client";
import type { Role } from "@/lib/auth";

/* Client-side data access for the Boards module. All calls go through supabase-js
   with the user's session, so RLS enforces every read/write. */

export type Board = {
  id: string;
  title: string;
  description: string | null;
  color: string | null;
  created_by: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type BoardList = {
  id: string;
  board_id: string;
  title: string;
  position: number;
  is_archived: boolean;
};

export type Card = {
  id: string;
  board_id: string;
  list_id: string;
  title: string;
  description: string | null;
  position: number;
  due_date: string | null;
  due_complete: boolean;
  cover_color: string | null;
  is_archived: boolean;
  created_by: string | null;
};

export type BoardRole = "admin" | "editor" | "member" | "commenter" | "viewer";

const sb = () => getSupabase();

export const isGlobalAdmin = (role?: Role) => role === "super_admin" || role === "admin";
/** super_admin / admin / manager — full access to all boards. */
export const isBoardSuperuser = (role?: Role) =>
  role === "super_admin" || role === "admin" || role === "manager";

export type ListMember = { list_id: string; user_id: string; added_at: string };

export async function listListMembers(listIds: string[]): Promise<ListMember[]> {
  if (!listIds.length) return [];
  const { data, error } = await sb().from("list_members").select("list_id, user_id, added_at").in("list_id", listIds);
  if (error) throw error;
  return data ?? [];
}
export async function addListMember(listId: string, userId: string, addedBy: string): Promise<void> {
  const { error } = await sb().from("list_members").insert({ list_id: listId, user_id: userId, added_by: addedBy });
  if (error) throw error;
}
export async function removeListMember(listId: string, userId: string): Promise<void> {
  const { error } = await sb().from("list_members").delete().eq("list_id", listId).eq("user_id", userId);
  if (error) throw error;
}
/** Superusers only: staff that can be assigned to lists (returns [] for others). */
export async function getAssignableStaff(): Promise<Profile[]> {
  const { data, error } = await sb().rpc("assignable_staff");
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function listBoards(): Promise<Board[]> {
  const { data, error } = await sb()
    .from("boards")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createBoard(input: {
  title: string;
  description?: string;
  color?: string;
  createdBy: string;
}): Promise<Board> {
  const { data, error } = await sb()
    .from("boards")
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      color: input.color || "#f95338",
      created_by: input.createdBy,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function archiveBoard(id: string): Promise<void> {
  const { error } = await sb().from("boards").update({ is_archived: true }).eq("id", id);
  if (error) throw error;
}

export async function updateBoard(
  id: string,
  patch: Partial<Pick<Board, "title" | "description" | "color">>,
): Promise<void> {
  const { error } = await sb().from("boards").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteBoard(id: string): Promise<void> {
  const { error } = await sb().from("boards").delete().eq("id", id);
  if (error) throw error;
}

export async function updateList(id: string, title: string): Promise<void> {
  const { error } = await sb().from("lists").update({ title: title.trim() }).eq("id", id);
  if (error) throw error;
}

export async function deleteList(id: string): Promise<void> {
  const { error } = await sb().from("lists").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await sb().from("cards").delete().eq("id", id);
  if (error) throw error;
}

export async function getBoard(id: string): Promise<Board | null> {
  const { data, error } = await sb().from("boards").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

/** Effective board role for the current user (admin for global admins). */
export async function myBoardRole(boardId: string, systemRole: Role | undefined, userId: string): Promise<BoardRole | null> {
  if (isGlobalAdmin(systemRole)) return "admin";
  const { data } = await sb()
    .from("board_members")
    .select("board_role")
    .eq("board_id", boardId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.board_role as BoardRole) ?? null;
}

export async function listLists(boardId: string): Promise<BoardList[]> {
  const { data, error } = await sb()
    .from("lists")
    .select("*")
    .eq("board_id", boardId)
    .eq("is_archived", false)
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listCards(boardId: string): Promise<Card[]> {
  const { data, error } = await sb()
    .from("cards")
    .select("*")
    .eq("board_id", boardId)
    .eq("is_archived", false)
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createList(boardId: string, title: string, position: number): Promise<BoardList> {
  const { data, error } = await sb()
    .from("lists")
    .insert({ board_id: boardId, title: title.trim(), position })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createCard(
  boardId: string,
  listId: string,
  title: string,
  position: number,
  createdBy: string,
): Promise<Card> {
  const { data, error } = await sb()
    .from("cards")
    .insert({ board_id: boardId, list_id: listId, title: title.trim(), position, created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** next position = max(existing) + 1 (used for appends). */
export const nextPosition = (items: { position: number }[]) =>
  items.length ? Math.max(...items.map((i) => i.position)) + 1 : 1;

/* ===========================================================================
   Phase 4–6 — moves, card detail, labels, assignees, checklists, comments,
   attachments, activity, member directory.
   =========================================================================== */

export type Label = { id: string; board_id: string; name: string | null; color: string };
export type CardLabel = { card_id: string; label_id: string };
export type Assignee = { card_id: string; user_id: string };
export type Checklist = { id: string; card_id: string; title: string; position: number };
export type ChecklistItem = {
  id: string; checklist_id: string; content: string; is_done: boolean; position: number;
  completed_by: string | null; completed_at: string | null;
};
export type Comment = {
  id: string; card_id: string; author_id: string; body: string; created_at: string; updated_at: string;
};
export type Attachment = {
  id: string; card_id: string; kind: "file" | "link"; file_name: string; url: string | null;
  storage_path: string | null; mime_type: string | null; size_bytes: number | null;
  uploaded_by: string | null; created_at: string;
};
export type Activity = {
  id: string; board_id: string; card_id: string | null; actor_id: string | null;
  type: string; data: Record<string, unknown>; created_at: string;
};
export type BoardMember = { board_id: string; user_id: string; board_role: BoardRole; added_at: string };
export type Profile = { id: string; full_name: string | null; username: string | null; avatar_url: string | null; role: Role };

const ATTACH_BUCKET = "board-attachments";

/* ---- moves --------------------------------------------------------------- */
export async function moveCard(cardId: string, listId: string, position: number): Promise<void> {
  const { error } = await sb().from("cards").update({ list_id: listId, position }).eq("id", cardId);
  if (error) throw error;
}

/* compute a midpoint position for an item dropped between `before` and `after`. */
export function midpoint(before?: number, after?: number): number {
  if (before == null && after == null) return 1;
  if (before == null) return after! - 1;
  if (after == null) return before + 1;
  return (before + after) / 2;
}

/* ---- card detail --------------------------------------------------------- */
export async function getCard(cardId: string): Promise<Card | null> {
  const { data, error } = await sb().from("cards").select("*").eq("id", cardId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateCard(
  cardId: string,
  patch: Partial<Pick<Card, "title" | "description" | "due_date" | "due_complete" | "cover_color">>,
): Promise<void> {
  const { error } = await sb().from("cards").update(patch).eq("id", cardId);
  if (error) throw error;
}

/* ---- labels -------------------------------------------------------------- */
export async function listLabels(boardId: string): Promise<Label[]> {
  const { data, error } = await sb().from("labels").select("*").eq("board_id", boardId);
  if (error) throw error;
  return data ?? [];
}
export async function createLabel(boardId: string, name: string, color: string): Promise<Label> {
  const { data, error } = await sb().from("labels").insert({ board_id: boardId, name: name.trim() || null, color }).select().single();
  if (error) throw error;
  return data;
}
export async function deleteLabel(id: string): Promise<void> {
  const { error } = await sb().from("labels").delete().eq("id", id);
  if (error) throw error;
}
export async function listCardLabels(cardIds: string[]): Promise<CardLabel[]> {
  if (!cardIds.length) return [];
  const { data, error } = await sb().from("card_labels").select("*").in("card_id", cardIds);
  if (error) throw error;
  return data ?? [];
}
export async function addCardLabel(cardId: string, labelId: string): Promise<void> {
  const { error } = await sb().from("card_labels").insert({ card_id: cardId, label_id: labelId });
  if (error) throw error;
}
export async function removeCardLabel(cardId: string, labelId: string): Promise<void> {
  const { error } = await sb().from("card_labels").delete().eq("card_id", cardId).eq("label_id", labelId);
  if (error) throw error;
}

/* ---- assignees + members + directory ------------------------------------- */
export async function listBoardMembers(boardId: string): Promise<BoardMember[]> {
  const { data, error } = await sb().from("board_members").select("*").eq("board_id", boardId);
  if (error) throw error;
  return data ?? [];
}
export async function listAssignees(cardIds: string[]): Promise<Assignee[]> {
  if (!cardIds.length) return [];
  const { data, error } = await sb().from("card_assignees").select("card_id, user_id").in("card_id", cardIds);
  if (error) throw error;
  return data ?? [];
}
export async function addAssignee(cardId: string, userId: string, assignedBy: string): Promise<void> {
  const { error } = await sb().from("card_assignees").insert({ card_id: cardId, user_id: userId, assigned_by: assignedBy });
  if (error) throw error;
}
export async function removeAssignee(cardId: string, userId: string): Promise<void> {
  const { error } = await sb().from("card_assignees").delete().eq("card_id", cardId).eq("user_id", userId);
  if (error) throw error;
}
export async function getDirectory(): Promise<Profile[]> {
  const { data, error } = await sb().rpc("directory");
  if (error) throw error;
  return (data ?? []) as Profile[];
}

/* ---- checklists ---------------------------------------------------------- */
export async function listChecklists(cardId: string): Promise<Checklist[]> {
  const { data, error } = await sb().from("checklists").select("*").eq("card_id", cardId).order("position");
  if (error) throw error;
  return data ?? [];
}
export async function listChecklistItems(checklistIds: string[]): Promise<ChecklistItem[]> {
  if (!checklistIds.length) return [];
  const { data, error } = await sb().from("checklist_items").select("*").in("checklist_id", checklistIds).order("position");
  if (error) throw error;
  return data ?? [];
}
export async function createChecklist(cardId: string, title: string, position: number): Promise<Checklist> {
  const { data, error } = await sb().from("checklists").insert({ card_id: cardId, title: title.trim() || "Checklist", position }).select().single();
  if (error) throw error;
  return data;
}
export async function deleteChecklist(id: string): Promise<void> {
  const { error } = await sb().from("checklists").delete().eq("id", id);
  if (error) throw error;
}
export async function addChecklistItem(checklistId: string, content: string, position: number): Promise<ChecklistItem> {
  const { data, error } = await sb().from("checklist_items").insert({ checklist_id: checklistId, content: content.trim(), position }).select().single();
  if (error) throw error;
  return data;
}
export async function setChecklistItemDone(id: string, isDone: boolean, userId: string): Promise<void> {
  const { error } = await sb()
    .from("checklist_items")
    .update({ is_done: isDone, completed_by: isDone ? userId : null, completed_at: isDone ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}
export async function deleteChecklistItem(id: string): Promise<void> {
  const { error } = await sb().from("checklist_items").delete().eq("id", id);
  if (error) throw error;
}

/* ---- comments ------------------------------------------------------------ */
export async function listComments(cardId: string): Promise<Comment[]> {
  const { data, error } = await sb().from("comments").select("*").eq("card_id", cardId).order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
export async function addComment(cardId: string, authorId: string, body: string): Promise<Comment> {
  const { data, error } = await sb().from("comments").insert({ card_id: cardId, author_id: authorId, body: body.trim() }).select().single();
  if (error) throw error;
  return data;
}
export async function deleteComment(id: string): Promise<void> {
  const { error } = await sb().from("comments").delete().eq("id", id);
  if (error) throw error;
}

/* ---- attachments --------------------------------------------------------- */
export async function listAttachments(cardId: string): Promise<Attachment[]> {
  const { data, error } = await sb().from("attachments").select("*").eq("card_id", cardId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
export async function addLinkAttachment(cardId: string, name: string, url: string, uploadedBy: string): Promise<Attachment> {
  const { data, error } = await sb()
    .from("attachments")
    .insert({ card_id: cardId, kind: "link", file_name: name.trim() || url, url: url.trim(), uploaded_by: uploadedBy })
    .select().single();
  if (error) throw error;
  return data;
}
export async function addFileAttachment(boardId: string, cardId: string, file: File, uploadedBy: string): Promise<Attachment> {
  const safe = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${boardId}/${cardId}/${crypto.randomUUID()}-${safe}`;
  const up = await sb().storage.from(ATTACH_BUCKET).upload(path, file, { contentType: file.type || undefined });
  if (up.error) throw up.error;
  const { data, error } = await sb()
    .from("attachments")
    .insert({
      card_id: cardId, kind: "file", file_name: file.name, storage_path: path,
      mime_type: file.type || null, size_bytes: file.size, uploaded_by: uploadedBy,
    })
    .select().single();
  if (error) throw error;
  return data;
}
export async function attachmentUrl(a: Attachment): Promise<string | null> {
  if (a.kind === "link") return a.url;
  if (!a.storage_path) return null;
  const { data, error } = await sb().storage.from(ATTACH_BUCKET).createSignedUrl(a.storage_path, 3600);
  if (error) return null;
  return data.signedUrl;
}
export async function deleteAttachment(a: Attachment): Promise<void> {
  if (a.kind === "file" && a.storage_path) {
    await sb().storage.from(ATTACH_BUCKET).remove([a.storage_path]);
  }
  const { error } = await sb().from("attachments").delete().eq("id", a.id);
  if (error) throw error;
}

/* ---- activity ------------------------------------------------------------ */
export async function listCardActivity(cardId: string): Promise<Activity[]> {
  const { data, error } = await sb().from("activity").select("*").eq("card_id", cardId).order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}
