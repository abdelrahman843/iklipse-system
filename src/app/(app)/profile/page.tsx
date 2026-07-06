"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, AlertCircle, Trash2, ShieldCheck, KeyRound, X } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard, Avatar, Badge } from "@/components/ui/primitives";
import { useAuth, roleLabels } from "@/lib/auth";

const ORANGE = "#F95338";
const field =
  "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-white/25";

export default function ProfilePage() {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwOpen, setPwOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name);
    setUsername(currentUser.username);
    setEmail(currentUser.email);
    setBio(currentUser.bio ?? "");
    setAvatar(currentUser.avatar);
  }, [currentUser]);

  if (!currentUser) return null;

  // Downscale uploaded images to keep them small (persists reliably in localStorage).
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imgEl = new Image();
      imgEl.onload = () => {
        const max = 256;
        const scale = Math.min(max / imgEl.width, max / imgEl.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(imgEl.width * scale);
        canvas.height = Math.round(imgEl.height * scale);
        canvas.getContext("2d")?.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
        setAvatar(canvas.toDataURL("image/jpeg", 0.85));
        setMsg(null);
      };
      imgEl.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile({ name, username, email, bio, avatar: avatar ?? null });
    setMsg(res.ok ? { ok: true, text: "Profile saved." } : { ok: false, text: res.error ?? "Could not save." });
  };

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile settings"
        subtitle="Update your name, username, email, bio and photo. These show across the hub."
      />

      <form onSubmit={save} className="grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* Avatar card */}
        <Reveal>
          <GlassCard className="flex flex-col items-center rounded-[1.5rem] p-6 text-center">
            <Avatar name={name || currentUser.name} color="#3f3f46" size={108} ring="rgba(255,255,255,0.25)" src={avatar} />
            <p className="mt-4 font-display text-base font-semibold text-ink">{name || currentUser.name}</p>
            <Badge className="mt-2 border-accent/30 bg-accent/10 text-accent-soft">
              <ShieldCheck className="size-3" /> {roleLabels[currentUser.role]}
            </Badge>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
            <div className="mt-5 flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm text-ink transition-colors hover:bg-white/10"
              >
                <Camera className="size-4" /> Upload photo
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar(undefined)}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl text-sm text-faint transition-colors hover:text-sla-red"
                >
                  <Trash2 className="size-3.5" /> Remove photo
                </button>
              )}
            </div>
          </GlassCard>
        </Reveal>

        {/* Fields */}
        <Reveal delay={0.06}>
          <GlassCard className="rounded-[1.5rem] p-6">
            {msg && (
              <div
                className={`mb-5 flex items-start gap-2 rounded-xl border p-3 text-[0.78rem] ${
                  msg.ok
                    ? "border-sla-green/30 bg-sla-green/10 text-sla-green"
                    : "border-sla-red/30 bg-sla-red/10 text-sla-red"
                }`}
              >
                {msg.ok ? <Check className="mt-0.5 size-3.5 shrink-0" /> : <AlertCircle className="mt-0.5 size-3.5 shrink-0" />}
                {msg.text}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[0.72rem] text-faint">Full name</span>
                <input value={name} onChange={(e) => { setName(e.target.value); setMsg(null); }} className={field} placeholder="Full name" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[0.72rem] text-faint">Username</span>
                <input value={username} onChange={(e) => { setUsername(e.target.value); setMsg(null); }} className={field} placeholder="Username" />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-[0.72rem] text-faint">Email</span>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setMsg(null); }} className={field} placeholder="you@iklipse.com" />
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-[0.72rem] text-faint">Bio</span>
              <textarea
                value={bio}
                onChange={(e) => { setBio(e.target.value); setMsg(null); }}
                rows={3}
                placeholder="A short bio that shows on your profile."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-white/25"
              />
            </label>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5">
              <button
                type="button"
                onClick={() => setPwOpen(true)}
                className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-ink transition-colors hover:bg-white/10"
              >
                <KeyRound className="size-4" /> Change password
              </button>
              <button
                type="submit"
                className="flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
                style={{ background: ORANGE }}
              >
                <Check className="size-4" /> Save changes
              </button>
            </div>
          </GlassCard>
        </Reveal>
      </form>

      {mounted && createPortal(
        <AnimatePresence>
          {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} change={changePassword} />}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

function ChangePasswordModal({
  onClose,
  change,
}: {
  onClose: () => void;
  change: (oldPassword: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirm) { setErr("New passwords do not match."); return; }
    const res = await change(oldPw, newPw);
    if (res.ok) { setDone(true); setTimeout(onClose, 1100); }
    else setErr(res.error ?? "Could not change password.");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-sm overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-950 p-6"
      >
        <div className="brand-glow-soft pointer-events-none absolute inset-0 opacity-70" />
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 text-white/40 hover:text-white">
          <X className="size-4" />
        </button>
        <div className="relative z-[2]">
          <span className="grid size-11 place-items-center rounded-2xl" style={{ background: `${ORANGE}1f` }}>
            <KeyRound className="size-5" style={{ color: ORANGE }} />
          </span>
          <h3 className="mt-4 text-xl font-medium tracking-[-0.02em] text-white">Change password</h3>

          {done ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-sla-green/30 bg-sla-green/10 p-3 text-sm text-sla-green">
              <Check className="size-4" /> Password updated.
            </div>
          ) : (
            <>
              {err && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-sla-red/30 bg-sla-red/10 p-3 text-[0.78rem] text-sla-red">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> {err}
                </div>
              )}
              <div className="mt-4 space-y-3">
                <input type="password" autoFocus placeholder="Old password" value={oldPw} onChange={(e) => { setOldPw(e.target.value); setErr(null); }} className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25" />
                <input type="password" placeholder="New password" value={newPw} onChange={(e) => { setNewPw(e.target.value); setErr(null); }} className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25" />
                <input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setErr(null); }} className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25" />
                <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-transform hover:scale-[1.02]" style={{ background: ORANGE }}>
                  Update password
                </button>
              </div>
            </>
          )}
        </div>
      </motion.form>
    </motion.div>
  );
}
