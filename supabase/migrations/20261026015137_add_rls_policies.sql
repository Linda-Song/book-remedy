-- RLS 
alter table prescriptions enable row level security;
alter table reviews enable row level security;
alter table daily_usage enable row level security;

-- prescriptions
create policy "Users can view own prescriptions"
 on prescriptions for SELECT
 using (auth.uid() = user_id);

 create policy "Users can insert own prescriptions"
  on prescriptions for INSERT
  with check (auth.uid() = user_id);

create policy "User can update own prescriptions"
  on prescriptions for UPDATE 
  using (auth.uid() = user_id);

-- reviews
create policy "Users can view own reviews"
  on reviews for SELECT
  using (
    exists (
      select 1 from prescriptions
      where prescriptions.id = reviews.prescription_id
      and prescriptions.user_id = auth.uid()
    )
  );

create policy "Anyone can view public reviews"
  on reviews for SELECT
  using (is_public = true);

create policy "User can insert own reviews"
  on reviews for INSERT
  with check (
    exists (
      select 1 from prescriptions
      where prescriptions.id = reviews.prescription_id
      and prescriptions.user_id = auth.uid()
    )
  );

create policy "Users can update own reviews"
  on reviews for UPDATE
  using (
    exists (
      select 1 from prescriptions
      where prescriptions.id = reviews.prescription_id
      and prescriptions.user_id = auth.uid()
    )
  );

-- daily usage
create policy "Users can view own usage"
  on daily_usage for SELECT
  using (owner_key = auth.uid()::text);
  

