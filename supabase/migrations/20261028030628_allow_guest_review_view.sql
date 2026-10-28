create policy "Anyone can view guest prescription reviews"
  on reviews for select
  using (
    exists (
      select 1 from prescriptions
      where prescriptions.id = reviews.prescription_id
      and prescriptions.user_id is null
    )
  );