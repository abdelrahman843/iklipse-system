"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { img } from "@/lib/landing";

const ORANGE = "#F95338";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.ok) router.push("/dashboard");
    else setError(res.error ?? "Could not sign in.");
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
      >
        <div className="brand-glow-soft pointer-events-none absolute inset-0 opacity-80" />
        <form onSubmit={submit} className="relative z-[2]">
          <div className="mb-6 flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.emblemWhite} alt="iklipse" className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-tight text-white">iklipse</span>
            <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.66rem] text-white/60">
              Team Workspace
            </span>
          </div>
          <h1 className="text-2xl font-medium tracking-[-0.03em] text-white">Sign in</h1>
          <p className="mt-2 text-sm font-light text-white/55">Access the iklipse central hub.</p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-sla-red/30 bg-sla-red/10 p-3 text-[0.78rem] text-sla-red">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-5 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder="Email"
              autoFocus
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/25"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="Password"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/25"
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: ORANGE }}
            >
              {submitting ? "Signing in…" : "Sign in"} <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/8 bg-white/[0.03] p-3 text-[0.72rem] text-white/50">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-white/40" />
            Sign-up is invite-only. Accounts are created by an admin - there is no public registration.
          </div>

          <div className="mt-3">
            {!forgot ? (
              <button type="button" onClick={() => setForgot(true)} className="text-xs text-white/50 transition-colors hover:text-white/80">
                Forgot password?
              </button>
            ) : forgotSent ? (
              <div className="rounded-xl border border-sla-green/30 bg-sla-green/10 p-3 text-[0.72rem] text-sla-green">
                Your admins (Marshall and Omar) have been notified to reset your password. They will reach out at your iklipse email.
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="mb-2 text-[0.72rem] text-white/55">
                  Enter your username and we will notify your admins to reset it.
                </p>
                <input
                  placeholder="Username or email"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25"
                />
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="mt-2 h-9 w-full rounded-lg text-sm font-medium text-white transition-transform hover:scale-[1.01]"
                  style={{ background: ORANGE }}
                >
                  Notify admins
                </button>
              </div>
            )}
          </div>

          <Link href="/launch" className="mt-5 flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white/70">
            <ArrowLeft className="size-3.5" /> Back to launch
          </Link>
        </form>
      </motion.div>
    </div>
  );
}
