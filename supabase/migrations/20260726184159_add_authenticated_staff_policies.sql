create policy "Authenticated staff can read bookings" on bookings for select to authenticated using (true);
create policy "Authenticated staff can update bookings" on bookings for update to authenticated using (true) with check (true);
create policy "Authenticated staff can read booking_services" on booking_services for select to authenticated using (true);
create policy "Authenticated staff can read all reviews" on reviews for select to authenticated using (true);
create policy "Authenticated staff can moderate reviews" on reviews for update to authenticated using (true) with check (true);
