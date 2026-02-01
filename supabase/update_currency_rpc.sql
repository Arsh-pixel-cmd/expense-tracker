-- Force update the currency conversion RPC to ensure it works correctly
-- Uses UPSERT logic to verify settings exist
create or replace function convert_currency(
  p_user_id uuid,
  p_rate numeric,
  p_new_currency text
)
returns void
language plpgsql
security definer
as $$
begin
  -- Update transactions
  update transactions
  set amount = amount * p_rate
  where user_id = p_user_id;

  -- Upsert settings (Create if not exists, otherwise update)
  insert into settings (user_id, currency, notifications, dark_mode, auto_categ, language)
  values (p_user_id, p_new_currency, true, false, true, 'English')
  on conflict (user_id) do update
  set currency = p_new_currency;
end;
$$;
