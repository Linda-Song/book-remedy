create policy "Anyone can insert guest prescription reviews"
  on reviews for insert
  with check (
    exists (
      select 1 from prescriptions
      where prescriptions.id = reviews.prescription_id
      and prescriptions.user_id is null
    )
  );

create policy "Anyone can update guest prescription reviews"
  on reviews for update
  using (
    exists (
      select 1 from prescriptions
      where prescriptions.id = reviews.prescription_id
      and prescriptions.user_id is null
    )
  );

create policy "Anyone can update own guest prescriptions"
  on prescriptions for update
  using (user_id is null);