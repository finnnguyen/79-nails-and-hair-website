-- Lightweight anti-abuse rate limiting for the two public insert endpoints
-- (bookings, reviews). Not accessible directly by anon/authenticated — only
-- through the SECURITY DEFINER function below, which is the only thing
-- allowed to read/write it.
create table rate_limit_hits (
  id bigint generated always as identity primary key,
  key text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_hits_key_created_idx on rate_limit_hits (key, created_at);

alter table rate_limit_hits enable row level security;

-- Records a hit for `p_key` and reports whether the caller is still under
-- `p_max_count` hits within the trailing `p_window_minutes`. Approximate
-- under concurrent requests (count-then-insert isn't atomic) — acceptable
-- for anti-abuse limiting, not a correctness-critical ledger.
create function public.check_rate_limit(p_key text, p_max_count int, p_window_minutes int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  delete from public.rate_limit_hits
  where key = p_key
    and created_at < now() - (p_window_minutes || ' minutes')::interval;

  select count(*) into v_count
  from public.rate_limit_hits
  where key = p_key
    and created_at >= now() - (p_window_minutes || ' minutes')::interval;

  if v_count >= p_max_count then
    return false;
  end if;

  insert into public.rate_limit_hits (key) values (p_key);
  return true;
end;
$$;

revoke all on function public.check_rate_limit(text, int, int) from public;
grant execute on function public.check_rate_limit(text, int, int) to anon, authenticated;
