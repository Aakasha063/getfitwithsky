UPDATE public.workout_sessions ws
SET session_date = sub.last_day, updated_at = now()
FROM (
  SELECT es.session_id, max((s.performed_at AT TIME ZONE 'UTC')::date) AS last_day
  FROM public.sets s
  JOIN public.exercise_sessions es ON es.id = s.exercise_session_id
  GROUP BY es.session_id
) sub
WHERE ws.id = sub.session_id
  AND ws.status = 'completed'
  AND ws.session_date <> sub.last_day;