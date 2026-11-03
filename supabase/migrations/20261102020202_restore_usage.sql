-- Give back one prescription when nothing was delivered to the reader
create or replace function restore_usage(p_owner_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update daily_usage
  set used = greatest(used - 1, 0)
  where owner_key = p_owner_key
    and day = current_date;
end;
$$;

-- Only the Edge Function (service role) may call these, never the browser
revoke execute on function restore_usage(text) from public, anon, authenticated;
grant execute on function restore_usage(text) to service_role;

revoke execute on function check_and_increment_usage(text, int) from public, anon, authenticated;
grant execute on function check_and_increment_usage(text, int) to service_role;