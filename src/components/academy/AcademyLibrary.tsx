"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  HardDrive, Video, MonitorPlay, FileQuestion, Play, Inbox, Plus, X, Sparkles,
  Send, Check, Upload, Users, Trash2,
} from "lucide-react";
import { lessons, members, type Lesson } from "@/lib/data";
import { products } from "@/lib/landing";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { useAssignments, type Assignment } from "@/lib/assignments";

const ORANGE = "#F95338";
const byId = Object.fromEntries(members.map((m) => [m.id, m]));

const sourceMeta = {
  drive: { icon: HardDrive, label: "Drive", color: "#f95338" },
  loom: { icon: Video, label: "Loom", color: "#ff7a63" },
  youtube: { icon: MonitorPlay, label: "YouTube", color: "#f95338" },
} as const;

const tabs = [
  { key: "internal", label: "Internal" },
  { key: "external", label: "External" },
  { key: "assigned", label: "Assigned" },
] as const;
type TabKey = (typeof tabs)[number]["key"];

const thumbFor = (id: string) => {
  const idx = Math.max(0, lessons.findIndex((l) => l.id === id));
  return products[(idx + 1) % products.length].thumb;
};

function toEmbed(url?: string): string | null {
  if (!url) return null;
  if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/").split("&")[0];
  if (url.includes("youtu.be/")) return "https://www.youtube.com/embed/" + url.split("youtu.be/")[1].split("?")[0];
  if (url.includes("vimeo.com/")) { const id = url.split("vimeo.com/")[1].split(/[/?]/)[0]; return `https://player.vimeo.com/video/${id}`; }
  if (url.includes("loom.com/share/")) return url.replace("/share/", "/embed/").split("?")[0];
  if (url.includes("player.vimeo.com") || url.includes("/embed/")) return url;
  return null;
}

/* ---- 16:9 lesson card (smaller + description below) --------------------- */
function LessonCard({ lesson, i }: { lesson: Lesson; i: number }) {
  const meta = sourceMeta[lesson.source];
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group text-left"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbFor(lesson.id)} alt={lesson.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
          <Play className="size-4 fill-current" />
        </span>
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[0.58rem] font-medium backdrop-blur-sm" style={{ color: meta.color }}>
          <meta.icon className="size-2.5" /> {meta.label}
        </span>
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[0.6rem] font-medium tnum text-white">{lesson.duration}</span>
        {lesson.progress > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/25"><div className="h-full bg-accent" style={{ width: `${lesson.progress}%` }} /></div>
        )}
      </div>
      <div className="mt-2.5">
        <p className="line-clamp-2 text-[0.82rem] font-medium leading-snug text-ink">{lesson.title}</p>
        <p className="mt-1 line-clamp-2 text-[0.72rem] font-light leading-snug text-muted">{lesson.desc}</p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[0.66rem] text-faint">
          <span>{lesson.track}</span>
          <span>·</span>
          <span>{lesson.progress === 100 ? "Completed" : lesson.progress > 0 ? `${lesson.progress}% watched` : "Not started"}</span>
          {lesson.hasQuiz && <span className="flex items-center gap-1 text-indigo-soft"><FileQuestion className="size-3" /> Quiz</span>}
        </div>
      </div>
    </motion.button>
  );
}

/* ======================================================================== */
export function AcademyLibrary() {
  const { currentUser } = useAuth();
  const { assignments, create, submit } = useAssignments();
  const isAdmin = currentUser?.role === "super_admin" || currentUser?.role === "admin";
  const meId = currentUser?.id ?? "me";

  const [tab, setTab] = useState<TabKey>("internal");
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [detail, setDetail] = useState<Assignment | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const internal = lessons.filter((l) => l.source !== "youtube");
  const external = lessons.filter((l) => l.source === "youtube");

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1 backdrop-blur-md">
        {tabs.map((t) => {
          const count = t.key === "internal" ? internal.length : t.key === "external" ? external.length : assignments.length;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn("relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors", tab === t.key ? "text-white" : "text-muted hover:text-ink")}>
              {tab === t.key && <motion.span layoutId="academy-tab" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
              <span className="relative z-[1] flex items-center gap-1.5">{t.label}<span className="tnum text-[0.66rem] opacity-70">{count}</span></span>
            </button>
          );
        })}
      </div>

      {tab === "internal" && (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {internal.map((l, i) => <LessonCard key={l.id} lesson={l} i={i} />)}
        </div>
      )}
      {tab === "external" && (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {external.map((l, i) => <LessonCard key={l.id} lesson={l} i={i} />)}
        </div>
      )}

      {tab === "assigned" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted">{isAdmin ? "Assignments you created" : "Assigned to me"}</p>
            {isAdmin && (
              <button onClick={() => setCreatorOpen(true)} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105" style={{ background: ORANGE }}>
                <Plus className="size-4" /> Assign
              </button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 py-16 text-center">
              <Inbox className="size-7 text-faint" />
              <p className="text-sm text-faint">{isAdmin ? "No assignments yet. Click Assign to create one." : "Nothing assigned to you right now."}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assignments.map((a) => {
                const submitted = a.submissions.length;
                const total = a.assignedTo.length || 1;
                return (
                  <button key={a.id} onClick={() => setDetail(a)} className="glass glass-hover flex flex-col p-4 text-left">
                    {a.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.image} alt="" className="mb-3 aspect-video w-full rounded-lg object-cover" />
                    )}
                    <p className="text-sm font-medium text-ink">{a.title}</p>
                    <p className="mt-1 line-clamp-2 text-[0.72rem] font-light text-muted">{a.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {a.assignedTo.slice(0, 4).map((mid) => byId[mid] && <Avatar key={mid} name={byId[mid].name} color={byId[mid].color} size={22} ring="rgba(10,10,12,1)" />)}
                        {a.assignedTo.length > 4 && <span className="grid size-[22px] place-items-center rounded-full bg-white/10 text-[0.6rem] text-muted">+{a.assignedTo.length - 4}</span>}
                      </div>
                      <span className="tnum rounded-full bg-white/5 px-2 py-0.5 text-[0.62rem] text-faint">{submitted}/{total} submitted</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {mounted && createPortal(
        <AnimatePresence>
          {creatorOpen && <AssignmentCreator onClose={() => setCreatorOpen(false)} onCreate={(a) => { create(a); setCreatorOpen(false); setTab("assigned"); }} />}
          {detail && <AssignmentDetail assignment={detail} meId={meId} isAdmin={isAdmin} onClose={() => setDetail(null)} onSubmit={(text) => { submit(detail.id, meId, text); }} />}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

/* ---- Modal shell -------------------------------------------------------- */
function Shell({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn("glass flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[1.25rem]", wide ? "max-w-3xl" : "max-w-md")}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ---- Assignment creator (text / image / video / AI / members) ---------- */
function AssignmentCreator({ onClose, onCreate }: { onClose: () => void; onCreate: (a: Omit<Assignment, "id" | "createdAt" | "submissions">) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [picked, setPicked] = useState<string[]>([]);
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Tell me the topic and I'll draft an assignment. e.g. 'quiz on the 15-minute response rule'." },
  ]);
  const [prompt, setPrompt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleMember = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const el = new Image();
      el.onload = () => { const max = 640; const s = Math.min(max / el.width, max / el.height, 1); const c = document.createElement("canvas"); c.width = el.width * s; c.height = el.height * s; c.getContext("2d")?.drawImage(el, 0, 0, c.width, c.height); setImage(c.toDataURL("image/jpeg", 0.82)); };
      el.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  };

  const askAI = () => {
    const p = prompt.trim(); if (!p) return;
    const draft = `Watch the full video, then in 200-300 words: (1) summarise the 3 most important takeaways from "${p}", (2) give one concrete example of how you'll apply it to a live client this week, and (3) note one thing you'd do differently. Be specific.`;
    setChat((c) => [...c, { role: "user", text: p }, { role: "ai", text: draft }]);
    setPrompt("");
  };

  const create = () => {
    if (!title.trim()) return;
    onCreate({ title: title.trim(), description: description.trim(), image, videoUrl: videoUrl.trim() || undefined, assignedTo: picked });
  };

  return (
    <Shell onClose={onClose} wide>
      <div className="flex items-center justify-between border-b border-white/8 p-4">
        <p className="font-display text-sm font-semibold text-ink">New assignment</p>
        <button onClick={onClose} className="text-faint hover:text-ink"><X className="size-4" /></button>
      </div>
      <div className="grid flex-1 gap-5 overflow-y-auto p-5 md:grid-cols-2">
        {/* left: fields */}
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-ink outline-none placeholder:text-faint focus:border-white/25" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Instructions / description (or use the AI assistant)" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-white/25" />
          <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video link (YouTube / Vimeo / Loom)" className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-ink outline-none placeholder:text-faint focus:border-white/25" />
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} className="hidden" />
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm text-ink hover:bg-white/10">
              <Upload className="size-4" /> {image ? "Change image" : "Add image"}
            </button>
            {image && <button type="button" onClick={() => setImage(undefined)} className="grid size-10 place-items-center rounded-xl text-faint hover:text-sla-red"><Trash2 className="size-4" /></button>}
          </div>
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="aspect-video w-full rounded-lg object-cover" />
          )}

          {/* member picker = the team database */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="mb-2 flex items-center gap-1.5 text-[0.72rem] font-medium text-faint"><Users className="size-3.5" /> Assign to ({picked.length})</p>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {members.map((m) => (
                <button key={m.id} type="button" onClick={() => toggleMember(m.id)} className={cn("flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors", picked.includes(m.id) ? "bg-accent/15" : "hover:bg-white/5")}>
                  <Avatar name={m.name} color={m.color} size={26} />
                  <div className="min-w-0 flex-1"><p className="truncate text-[0.8rem] text-ink">{m.name}</p><p className="truncate text-[0.62rem] text-faint">{m.role}</p></div>
                  {picked.includes(m.id) && <Check className="size-4 text-accent" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* right: AI chat */}
        <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2 border-b border-white/8 p-3">
            <Sparkles className="size-4 text-accent" />
            <p className="text-sm font-medium text-ink">AI assistant</p>
          </div>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3" style={{ minHeight: 180 }}>
            {chat.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-xl px-3 py-2 text-[0.78rem] leading-snug", m.role === "user" ? "bg-accent text-white" : "bg-white/8 text-ink")}>
                  {m.text}
                  {m.role === "ai" && i > 0 && (
                    <button onClick={() => setDescription(m.text)} className="mt-1.5 block text-[0.68rem] font-medium text-accent-soft hover:text-accent">Use this as the description</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 p-2.5">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-3 pr-1.5">
              <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") askAI(); }} placeholder="Ask the AI to build it…" className="h-9 flex-1 bg-transparent text-[0.8rem] text-ink outline-none placeholder:text-faint" />
              <button onClick={askAI} className="grid size-8 place-items-center rounded-full text-white" style={{ background: ORANGE }}><Send className="size-3.5" /></button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-white/8 p-4">
        <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-muted hover:text-ink">Cancel</button>
        <button onClick={create} disabled={!title.trim()} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-40" style={{ background: ORANGE }}>
          <Check className="size-4" /> Create &amp; assign
        </button>
      </div>
    </Shell>
  );
}

/* ---- Assignment detail (watch + submit) -------------------------------- */
function AssignmentDetail({ assignment, meId, isAdmin, onClose, onSubmit }: { assignment: Assignment; meId: string; isAdmin: boolean; onClose: () => void; onSubmit: (text: string) => void }) {
  const embed = toEmbed(assignment.videoUrl);
  const mine = assignment.submissions.find((s) => s.memberId === meId);
  const [text, setText] = useState(mine?.text ?? "");
  const [done, setDone] = useState(!!mine);

  return (
    <Shell onClose={onClose} wide>
      <div className="flex items-center justify-between border-b border-white/8 p-4">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-ink">{assignment.title}</p>
          <p className="text-[0.66rem] text-faint">Assigned to {assignment.assignedTo.length} · {assignment.submissions.length} submitted</p>
        </div>
        <button onClick={onClose} className="text-faint hover:text-ink"><X className="size-4" /></button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {embed ? (
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black"><iframe src={embed} title={assignment.title} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div>
        ) : assignment.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={assignment.image} alt="" className="aspect-video w-full rounded-xl object-cover" />
        ) : null}

        {assignment.description && <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{assignment.description}</p>}

        {isAdmin ? (
          <div>
            <p className="mb-2 text-[0.72rem] font-medium uppercase tracking-wider text-faint">Submissions ({assignment.submissions.length})</p>
            <div className="space-y-2">
              {assignment.submissions.length === 0 && <p className="text-sm text-faint">No submissions yet.</p>}
              {assignment.submissions.map((s) => (
                <div key={s.memberId} className="glass-inset p-3">
                  <p className="text-[0.72rem] text-accent-soft">{byId[s.memberId]?.name ?? s.memberId} · {s.submittedAt}</p>
                  <p className="mt-1 text-sm text-ink">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="mb-2 text-[0.72rem] font-medium text-faint">Your submission</p>
            {done ? (
              <div className="flex items-center gap-2 rounded-lg border border-sla-green/30 bg-sla-green/10 p-3 text-sm text-sla-green"><Check className="size-4" /> Submitted. You can update it below.</div>
            ) : null}
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Write your answer…" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-white/25" />
            <button onClick={() => { if (text.trim()) { onSubmit(text.trim()); setDone(true); } }} className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-white" style={{ background: ORANGE }}>
              {done ? "Update submission" : "Submit assignment"}
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}
