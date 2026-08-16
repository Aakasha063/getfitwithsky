create or replace function public.get_leaderboard(period_days integer default 30)
returns table (
  user_id uuid,
  display_name text,
  sessions integer,
  sets_count integer,
  total_volume numeric,
  last_session date,
  active_weeks integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    coalesce(nullif(trim(p.name), ''), 'Athlete ' || left(p.id::text, 4)) as display_name,
    (
      select count(*) from public.workout_sessions ws
      where ws.user_id = p.id and ws.status = 'completed'
        and ws.session_date >= current_date - period_days
    )::int,
    (
      select count(*) from public.sets s
      where s.user_id = p.id and s.completed and not s.is_warmup
        and s.performed_at >= now() - make_interval(days => period_days)
    )::int,
    coalesce((
      select sum(coalesce(s.weight_kg, 0) * coalesce(s.reps, 0)) from public.sets s
      where s.user_id = p.id and s.completed and not s.is_warmup
        and s.performed_at >= now() - make_interval(days => period_days)
    ), 0)::numeric,
    (
      select max(ws.session_date) from public.workout_sessions ws
      where ws.user_id = p.id and ws.status = 'completed'
    ),
    (
      select count(distinct date_trunc('week', ws.session_date)) from public.workout_sessions ws
      where ws.user_id = p.id and ws.status = 'completed'
        and ws.session_date >= current_date - period_days
    )::int
  from public.profiles p
$$;

revoke all on function public.get_leaderboard(integer) from public, anon;
grant execute on function public.get_leaderboard(integer) to authenticated;
grant execute on function public.get_leaderboard(integer) to service_role;