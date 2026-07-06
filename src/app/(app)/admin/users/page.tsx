"use client";

import { useState } from "react";
import { UserPlus, ShieldCheck, Trash2, Check, AlertCircle, Lock } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard, Avatar, Badge } from "@/components/ui/primitives";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { useAuth, roleLabels, type Role } from "@/lib/auth";

const ORANGE = "#F95338";
const assignableRoles: Role[] = ["admin", "manager", "member", "client"];

export default function UsersAdminPage() {
  const { currentUser, users, addUser, removeUser } = useAuth();
  const [form, setForm] = useState({ name: "", username: "", email: "", role: "member" as Role, password: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const isAdmin = currentUser?.role === "super_admin" || currentUser?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <GlassCard className="flex max-w-sm flex-col items-center p-8 text-center">
          <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-sla-red/10">
            <Lock className="size-6 text-sla-red" />
          </span>
          <p className="font-display text-lg font-semibold text-ink">Restricted</p>
          <p className="mt-1.5 text-sm text-muted">User management is available to admins only.</p>
        </GlassCard>
      </div>
    );
  }

  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await addUser(form);
    setSubmitting(false);
    if (res.ok) {
      setMsg({ ok: true, text: `${form.name} added. They can sign in with their email and temporary password.` });
      setForm({ name: "", username: "", email: "", role: "member", password: "" });
    } else {
      setMsg({ ok: false, text: res.error ?? "Could not add user." });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="User Management"
        subtitle="Create and manage accounts. Sign-up is invite-only - people can only sign in once you add them here."
        action={
          <Badge className="border-accent/30 bg-accent/10 text-accent-soft">
            <ShieldCheck className="size-3" /> {roleLabels[currentUser!.role]}
          </Badge>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Users list */}
        <Reveal>
          <GlassCard className="overflow-hidden rounded-[1.5rem]">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-3.5">
              <p className="font-display text-sm font-semibold text-ink">Accounts</p>
              <span className="tnum text-xs text-faint">{users.length} total</span>
            </div>
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 border-b border-white/5 px-5 py-3.5 last:border-0 transition-colors hover:bg-white/[0.03]"
              >
                <Avatar name={u.name} color="#3f3f46" size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">
                    {u.name} <span className="text-faint">@{u.username}</span>
                  </p>
                  <p className="truncate text-[0.7rem] text-faint">{u.email || "no email"}</p>
                </div>
                <Badge
                  className={
                    u.role === "super_admin"
                      ? "border-accent/30 bg-accent/10 text-accent-soft"
                      : "border-white/10 bg-white/5 text-muted"
                  }
                >
                  {roleLabels[u.role]}
                </Badge>
                {u.id !== "u-billy" ? (
                  <button
                    onClick={() => removeUser(u.id)}
                    title="Remove user"
                    className="grid size-8 place-items-center rounded-lg text-faint transition-colors hover:bg-sla-red/10 hover:text-sla-red"
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : (
                  <span className="grid size-8 place-items-center text-faint" title="Protected">
                    <Lock className="size-3.5" />
                  </span>
                )}
              </div>
            ))}
          </GlassCard>
        </Reveal>

        {/* Add user */}
        <Reveal delay={0.06}>
          <GlassCard className="rounded-[1.5rem] p-6">
            <div className="mb-4 flex items-center gap-2">
              <UserPlus className="size-4 text-accent" />
              <p className="font-display text-sm font-semibold text-ink">Add a user</p>
            </div>

            {msg && (
              <div
                className={`mb-4 flex items-start gap-2 rounded-xl border p-3 text-[0.78rem] ${
                  msg.ok
                    ? "border-sla-green/30 bg-sla-green/10 text-sla-green"
                    : "border-sla-red/30 bg-sla-red/10 text-sla-red"
                }`}
              >
                {msg.ok ? <Check className="mt-0.5 size-3.5 shrink-0" /> : <AlertCircle className="mt-0.5 size-3.5 shrink-0" />}
                {msg.text}
              </div>
            )}

            <form onSubmit={submit} className="space-y-3">
              {[
                { k: "name", ph: "Full name", type: "text" },
                { k: "username", ph: "Username", type: "text" },
                { k: "email", ph: "Email (used to sign in)", type: "email" },
                { k: "password", ph: "Temporary password", type: "text" },
              ].map((f) => (
                <input
                  key={f.k}
                  type={f.type}
                  placeholder={f.ph}
                  value={form[f.k as keyof typeof form] as string}
                  onChange={(e) => { setForm({ ...form, [f.k]: e.target.value }); setMsg(null); }}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-white/25"
                />
              ))}
              <GlassSelect
                value={form.role}
                onChange={(v) => setForm({ ...form, role: v as Role })}
                ariaLabel="Role"
                buttonClassName="h-11"
                options={assignableRoles.map((r) => ({ value: r, label: roleLabels[r] }))}
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: ORANGE }}
              >
                <UserPlus className="size-4" /> {submitting ? "Creating…" : "Create account"}
              </button>
            </form>

            <p className="mt-4 text-[0.72rem] leading-relaxed text-faint">
              Later this connects to the CRM: adding a client there will auto-create their portal account and email
              them an invite.
            </p>
          </GlassCard>
        </Reveal>
      </div>
    </>
  );
}
