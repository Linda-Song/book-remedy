create policy "Anyone can view guest prescriptions"
  on prescriptions for select
  using (user_id is null);