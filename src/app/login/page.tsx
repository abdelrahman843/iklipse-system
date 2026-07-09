"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Emblem } from "@/components/ui/Emblem";
import { FieldError, ERROR_BORDER } from "@/components/ui/FieldError";
import { cn } from "@/lib/utils";

const ORANGE = "#F95338";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: { username?: string; password?: string } = {};
    if (!username.trim()) next.username = "Enter your username";
    if (!password) next.password = "Enter your password";
    setErrors(next);
    if (next.username || next.password) return;

    setSubmitting(true);
    const res = await login(username, password);
    setSubmitting(false);
    if (res.ok) router.push("/dashboard");
    else setErrors({ password: res.error ?? "Incorrect username or password" });
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-16">
      {/* subtle ambiance — one restrained warm hint, mostly neutral */}
      <div className="brand-glow-soft pointer-events-none absolute inset-0 opacity-25" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.08] blur-[130px]"
        style={{ width: 520, height: 520, background: ORANGE }}
      />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-10 w-full max-w-sm"
      >
        <form onSubmit={submit} noValidate>
          {/* centered brand header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 flex items-center gap-2.5">
              <Emblem className="h-6 w-6" />
              <span className="text-base font-semibold tracking-tight text-ink">iklipse</span>
            </div>
            <span className="mb-4 rounded-full border cc-divider bg-white/5 px-3 py-1 text-[0.64rem] uppercase tracking-[0.18em] text-muted">
              Team Workspace
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink">Sign in</h1>
            <p className="mt-2 text-sm font-light text-muted">Access the iklipse central hub.</p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <FieldError message={errors.username} />
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: undefined })); }}
                placeholder="Username"
                autoFocus
                className={cn(
                  "h-12 w-full rounded-xl border cc-divider bg-white/5 px-4 text-sm text-ink outline-none backdrop-blur-sm transition-colors placeholder:text-faint focus:border-ink/40",
                  errors.username && ERROR_BORDER,
                )}
              />
            </div>
            <div className="relative">
              <FieldError message={errors.password} />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                placeholder="Password"
                className={cn(
                  "h-12 w-full rounded-xl border cc-divider bg-white/5 px-4 text-sm text-ink outline-none backdrop-blur-sm transition-colors placeholder:text-faint focus:border-ink/40",
                  errors.password && ERROR_BORDER,
                )}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-black shadow-[0_10px_26px_-18px_rgba(0,0,0,0.6)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"} <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-xl cc-card p-3 text-[0.72rem] text-muted">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-faint" />
            Sign-up is invite-only. Accounts are created by an admin - there is no public registration.
          </div>

          <Link href="/launch" className="mt-6 flex items-center justify-center gap-2 text-xs text-faint hover:text-ink">
            <ArrowLeft className="size-3.5" /> Back to launch
          </Link>
        </form>
      </motion.div>
    </div>
  );
}
