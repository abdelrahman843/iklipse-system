import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/* ===========================================================================
   POST   /api/admin/users   → create an account (admin only)
   DELETE /api/admin/users   → delete an account (admin only)

   Authorization: the caller must send their Supabase access token as
   `Authorization: Bearer <jwt>`. We resolve it to a user with the service_role
   client, then confirm that user's profile role is super_admin or admin BEFORE
   performing any privileged action. The service_role key never leaves the
   server.
   =========================================================================== */

const ADMIN_ROLES = ["super_admin", "admin"];

type Caller = { ok: true; id: string } | { ok: false; status: number; error: string };

async function requireAdmin(request: NextRequest): Promise<Caller> {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!token) return { ok: false, status: 401, error: "Missing bearer token." };

  const admin = getSupabaseAdmin();

  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData.user) return { ok: false, status: 401, error: "Invalid or expired session." };

  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("role, is_active")
    .eq("id", userData.user.id)
    .single();

  if (profileErr || !profile) return { ok: false, status: 403, error: "No profile found." };
  if (!profile.is_active || !ADMIN_ROLES.includes(profile.role)) {
    return { ok: false, status: 403, error: "Admin access required." };
  }
  return { ok: true, id: userData.user.id };
}

export async function POST(request: NextRequest) {
  const caller = await requireAdmin(request);
  if (!caller.ok) return NextResponse.json({ error: caller.error }, { status: caller.status });

  let body: {
    name?: string;
    username?: string;
    email?: string;
    role?: string;
    password?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const username = body.username?.trim().toLowerCase();
  const password = body.password?.trim();
  const role = body.role?.trim() || "member";
  if (!username || !password) {
    return NextResponse.json({ error: "Username and a temporary password are required." }, { status: 400 });
  }
  if (!/^[a-z0-9._-]{3,}$/.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3+ characters: letters, numbers, dot, dash or underscore." },
      { status: 400 },
    );
  }

  // Supabase Auth is email-based; usernames map to a hidden internal email.
  const email = body.email?.trim().toLowerCase() || `${username}@iklipse.local`;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // admin-created accounts are pre-confirmed (no verify email)
    user_metadata: {
      full_name: body.name?.trim() ?? "",
      username,
      role,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  // The on_auth_user_created trigger writes the profile row automatically.
  return NextResponse.json({ ok: true, id: data.user?.id }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const caller = await requireAdmin(request);
  if (!caller.ok) return NextResponse.json({ error: caller.error }, { status: caller.status });

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const id = body.id?.trim();
  if (!id) return NextResponse.json({ error: "User id is required." }, { status: 400 });
  if (id === caller.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.auth.admin.deleteUser(id); // cascades to profiles
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
