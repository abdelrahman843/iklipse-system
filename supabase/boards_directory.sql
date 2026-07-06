-- =============================================================================
-- BOARDS — profile directory (run after boards.sql)
-- Lets a user resolve the names/avatars of people they share a board with,
-- WITHOUT exposing the whole profiles table. Returns: yourself, anyone who
-- shares at least one board with you, and (for global admins) everyone.
-- =============================================================================
create or replace function public.directory()
returns table (id uuid, full_name text, username text, avatar_url text, role public.app_role)
language sql stable security definer set search_path = public as $$
  select distinct p.id, p.full_name, p.username, p.avatar_url, p.role
  from public.profiles p
  where p.is_active and (
    public.is_global_admin()
    or p.id = auth.uid()
    or exists (
      select 1
      from public.board_members a
      join public.board_members b on a.board_id = b.board_id
      where a.user_id = auth.uid() and b.user_id = p.id
    )
  );
$$;

grant execute on function public.directory() to authenticated;
