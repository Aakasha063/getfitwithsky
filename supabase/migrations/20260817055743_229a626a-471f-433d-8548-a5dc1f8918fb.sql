CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.get_leaderboard(integer);

CREATE OR REPLACE FUNCTION private.leaderboard(period_days integer DEFAULT 30)
RETURNS TABLE(user_id uuid, display_name text, sessions integer, sets_count integer, total_volume numeric, last_session date, active_weeks integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

REVOKE ALL ON FUNCTION private.leaderboard(integer) FROM PUBLIC, anon, authenticated;

-- Public, non-privileged wrapper: only signed-in users, and only aggregate stats.
CREATE OR REPLACE FUNCTION public.get_leaderboard(period_days integer DEFAULT 30)
RETURNS TABLE(user_id uuid, display_name text, sessions integer, sets_count integer, total_volume numeric, last_session date, active_weeks integer)
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  select * from private.leaderboard(period_days)
$function$;

REVOKE ALL ON FUNCTION public.get_leaderboard(integer) FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.leaderboard(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO authenticated;