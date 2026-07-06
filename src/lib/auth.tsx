"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

/* ===========================================================================
   Supabase-backed auth + roles.
   - Login: email + password (Supabase Auth issues the JWT / Bearer token).
   - Identity + role live in public.profiles; supabase-js attaches the access
     token as `Authorization: Bearer <jwt>` so RLS enforces every read/write.
   - Admin-only mutations (create / delete users) go through /api/admin/users,
     which holds the service_role key server-side.
   The public shape of this context is unchanged from the prototype, except the
   methods are now async (they hit the network).
   =========================================================================== */

export type Role = "super_admin" | "admin" | "manager" | "member" | "client";

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
  bio?: string;
  avatar?: string;
};

export const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  member: "Team Member",
  client: "Client",
};

type Result = { ok: boolean; error?: string };

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  role: Role;
  is_active: boolean;
  avatar_url: string | null;
  bio: string | null;
  created_at: string | null;
};

function rowToUser(r: ProfileRow): AuthUser {
  return {
    id: r.id,
    name: r.full_name ?? "",
    username: r.username ?? "",
    email: r.email ?? "",
    role: r.role,
    active: r.is_active,
    createdAt: (r.created_at ?? "").slice(0, 10),
    avatar: r.avatar_url ?? undefined,
    bio: r.bio ?? undefined,
  };
}

const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong.");
const isAdminRole = (r?: Role) => r === "super_admin" || r === "admin";

type AuthContextValue = {
  ready: boolean;
  currentUser: AuthUser | null;
  users: AuthUser[];
  login: (email: string, password: string) => Promise<Result>;
  logout: () => Promise<void>;
  addUser: (d: { name: string; username: string; email: string; role: Role; password: string }) => Promise<Result>;
  removeUser: (id: string) => Promise<Result>;
  updateProfile: (patch: {
    name?: string;
    username?: string;
    email?: string;
    bio?: string;
    avatar?: string | null;
    password?: string;
  }) => Promise<Result>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<Result>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function getAccessToken(): Promise<string | null> {
  const { data } = await getSupabase().auth.getSession();
  return data.session?.access_token ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);

  // Admins can read every profile (RLS); everyone else only sees their own row.
  const loadUsers = useCallback(async (role: Role) => {
    if (!isAdminRole(role)) {
      setUsers([]);
      return;
    }
    try {
      const { data } = await getSupabase()
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });
      setUsers((data ?? []).map(rowToUser));
    } catch {
      setUsers([]);
    }
  }, []);

  const loadProfile = useCallback(
    async (uid: string): Promise<AuthUser | null> => {
      try {
        const { data, error } = await getSupabase().from("profiles").select("*").eq("id", uid).single();
        if (error || !data) {
          setCurrentUser(null);
          setUsers([]);
          return null;
        }
        const u = rowToUser(data);
        setCurrentUser(u);
        await loadUsers(u.role);
        return u;
      } catch {
        setCurrentUser(null);
        setUsers([]);
        return null;
      }
    },
    [loadUsers],
  );

  // Restore session on mount and keep it in sync with sign-in / sign-out / refresh.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    const supabase = getSupabase();
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) loadProfile(session.user.id).finally(() => active && setReady(true));
      else setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      // Defer DB calls out of the auth callback to avoid the supabase-js lock deadlock.
      setTimeout(() => {
        if (!active) return;
        if (session?.user) loadProfile(session.user.id);
        else {
          setCurrentUser(null);
          setUsers([]);
        }
      }, 0);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = useCallback(
    async (email: string, password: string): Promise<Result> => {
      if (!isSupabaseConfigured) return { ok: false, error: "Supabase is not configured yet. Add your keys to .env.local." };
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) return { ok: false, error: error.message };
        const u = data.user ? await loadProfile(data.user.id) : null;
        if (u && !u.active) {
          await supabase.auth.signOut();
          setCurrentUser(null);
          return { ok: false, error: "This account is deactivated." };
        }
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e) };
      }
    },
    [loadProfile],
  );

  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured) await getSupabase().auth.signOut();
    } finally {
      setCurrentUser(null);
      setUsers([]);
    }
  }, []);

  const addUser = useCallback(
    async (d: { name: string; username: string; email: string; role: Role; password: string }): Promise<Result> => {
      if (!isAdminRole(currentUser?.role)) return { ok: false, error: "Only admins can add users." };
      if (!d.name.trim() || !d.email.trim() || !d.password.trim()) {
        return { ok: false, error: "Name, email and a temporary password are required." };
      }
      try {
        const token = await getAccessToken();
        if (!token) return { ok: false, error: "Your session expired. Sign in again." };
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(d),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: json.error ?? "Could not create user." };
        await loadUsers(currentUser!.role);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e) };
      }
    },
    [currentUser, loadUsers],
  );

  const removeUser = useCallback(
    async (id: string): Promise<Result> => {
      if (!isAdminRole(currentUser?.role)) return { ok: false, error: "Only admins can remove users." };
      try {
        const token = await getAccessToken();
        if (!token) return { ok: false, error: "Your session expired. Sign in again." };
        const res = await fetch("/api/admin/users", {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: json.error ?? "Could not remove user." };
        await loadUsers(currentUser!.role);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e) };
      }
    },
    [currentUser, loadUsers],
  );

  const updateProfile = useCallback(
    async (patch: {
      name?: string;
      username?: string;
      email?: string;
      bio?: string;
      avatar?: string | null;
      password?: string;
    }): Promise<Result> => {
      if (!currentUser) return { ok: false, error: "Not signed in." };
      try {
        const supabase = getSupabase();

        const updates: Record<string, unknown> = {};
        if (patch.name !== undefined && patch.name.trim()) updates.full_name = patch.name.trim();
        if (patch.username !== undefined) updates.username = patch.username.trim() || null;
        if (patch.email !== undefined) updates.email = patch.email.trim();
        if (patch.bio !== undefined) updates.bio = patch.bio;
        if (patch.avatar !== undefined) updates.avatar_url = patch.avatar ?? null;

        if (Object.keys(updates).length) {
          const { error } = await supabase.from("profiles").update(updates).eq("id", currentUser.id);
          if (error) return { ok: false, error: error.message };
        }

        const nextEmail = patch.email?.trim().toLowerCase();
        if (nextEmail && nextEmail !== currentUser.email.toLowerCase()) {
          const { error } = await supabase.auth.updateUser({ email: nextEmail });
          if (error) return { ok: false, error: error.message };
        }
        if (patch.password) {
          const { error } = await supabase.auth.updateUser({ password: patch.password });
          if (error) return { ok: false, error: error.message };
        }

        await loadProfile(currentUser.id);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e) };
      }
    },
    [currentUser, loadProfile],
  );

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string): Promise<Result> => {
      if (!currentUser) return { ok: false, error: "Not signed in." };
      if (!newPassword.trim()) return { ok: false, error: "Enter a new password." };
      try {
        const supabase = getSupabase();
        // Supabase doesn't verify the current password on update, so re-authenticate first.
        const { error: vErr } = await supabase.auth.signInWithPassword({
          email: currentUser.email,
          password: oldPassword,
        });
        if (vErr) return { ok: false, error: "Old password is incorrect." };
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e) };
      }
    },
    [currentUser],
  );

  const value = useMemo(
    () => ({ ready, currentUser, users, login, logout, addUser, removeUser, updateProfile, changePassword }),
    [ready, currentUser, users, login, logout, addUser, removeUser, updateProfile, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
