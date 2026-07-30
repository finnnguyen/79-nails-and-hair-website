drop policy "Public read approved reviews" on reviews;
create policy "Public read approved reviews" on reviews for select to anon using (approved = true);
