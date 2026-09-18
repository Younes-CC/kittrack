-- Storage-Bucket für Buchbilder. Öffentlich lesbar (Cover sollen ohne
-- Login angezeigt werden), Schreibzugriff nur für authentifizierte Admins.

insert into storage.buckets (id, name, public)
values ('book-images', 'book-images', true)
on conflict (id) do nothing;

create policy "book_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'book-images');

create policy "book_images_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'book-images');

create policy "book_images_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'book-images')
  with check (bucket_id = 'book-images');

create policy "book_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'book-images');
