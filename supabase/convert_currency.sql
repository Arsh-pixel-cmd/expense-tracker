-- Create a function to convert currency for all transactions of a user
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
  where transactions.user_id = convert_currency.p_user_id;

  -- Update settings
  update settings
  set currency = p_new_currency
  where settings.user_id = convert_currency.p_user_id;
end;
$$;
