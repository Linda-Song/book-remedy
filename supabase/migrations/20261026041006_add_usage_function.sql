create or replace function check_and_increment_usage(
  p_owner_key text,
  p_limit int
)
returns int
language plpgsql
security definer
as $$
declare
  v_used int;
begin
  insert into daily_usage (owner_key, day, used)
  values (p_owner_key, current_date, 1)
  on conflict (owner_key, day)
  do update set used = daily_usage.used + 1
  where daily_usage.used < p_limit
  returning used into v_used;

  if v_used is null then
    return -1;
  end if;

  return v_used;
end;
$$;