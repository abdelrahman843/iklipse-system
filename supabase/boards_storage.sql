-- =============================================================================
-- BOARDS — Storage bucket for card file attachments (run after boards.sql)
-- Private bucket. Object path convention: {board_id}/{card_id}/{uuid}-{filename}
--   folder[1] = board_id, folder[2] = card_id  → permissions reuse board helpers.
-- Files are uploaded directly from the client (RLS below enforces access);
-- the app reads them via short-lived signed URLs.
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('board-attachments', 'board-attachments', false)
on conflict (id) do nothing;

-- read: anyone who can view the board
drop policy if exists board_attach_read on storage.objects;
create policy board_attach_read on storage.objects for select to authenticated
using (
  bucket_id = 'board-attachments'
  and public.can_view_board(((storage.foldername(name))[1])::uuid)
);

-- upload: anyone who can edit that specific card (editors/admins, or members on
-- their assigned cards) — mirrors the attachments-table RLS.
drop policy if exists board_attach_insert on storage.objects;
create policy board_attach_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'board-attachments'
  and public.can_edit_card(((storage.foldername(name))[2])::uuid)
);

-- delete: same edit check
drop policy if exists board_attach_delete on storage.objects;
create policy board_attach_delete on storage.objects for delete to authenticated
using (
  bucket_id = 'board-attachments'
  and public.can_edit_card(((storage.foldername(name))[2])::uuid)
);
