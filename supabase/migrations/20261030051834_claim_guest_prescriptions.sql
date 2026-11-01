-- Move guest prescriptions to the logged-in user
create or replace function claim_guest_prescriptions(p_guest_id uuid)
returns int
language plpgsql
security definer
as $$
declare
  v_count int;
begin
  -- auth.uid() is the verified user from the token; null means not logged in
  if auth.uid() is null then
    return 0;
  end if;

  update prescriptions
  set user_id = auth.uid(), guest_id = null
  where guest_id = p_guest_id
    and user_id is null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;