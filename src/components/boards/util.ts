import type { Activity, Profile } from "@/lib/boards";

export function colorFor(_id: string): string {
  return "#3f3f46"; // neutral zinc — avatars are neutral, orange reserved for accents
}

export type Dir = Map<string, Profile>;

export function nameOf(dir: Dir, id: string | null | undefined): string {
  if (!id) return "Someone";
  const p = dir.get(id);
  return p?.full_name || p?.username || "Member";
}

export function fmtDate(iso: string | null | undefined, withTime = false): string {
  if (!iso) return "";
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return withTime ? `${date} · ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : date;
}

export function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function describeActivity(a: Activity, dir: Dir): string {
  const d = a.data ?? {};
  switch (a.type) {
    case "card_created": return "created this card";
    case "card_moved": return "moved this card";
    case "card_renamed": return "renamed this card";
    case "description_changed": return "updated the description";
    case "due_date_changed": return d.due_date ? "set the due date" : "removed the due date";
    case "due_completed": return "marked the due date complete";
    case "due_reopened": return "reopened the due date";
    case "comment_added": return "commented";
    case "checklist_item_completed": return `completed "${String(d.content ?? "an item")}"`;
    case "attachment_added": return `attached ${String(d.file_name ?? "a file")}`;
    case "member_assigned": return `assigned ${nameOf(dir, String(d.user_id ?? ""))}`;
    case "member_unassigned": return `unassigned ${nameOf(dir, String(d.user_id ?? ""))}`;
    case "label_added": return "added a label";
    case "label_removed": return "removed a label";
    case "card_archived": return "archived this card";
    case "card_restored": return "restored this card";
    default: return a.type.replace(/_/g, " ");
  }
}
