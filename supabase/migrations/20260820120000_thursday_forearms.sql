-- Insert the two forearm exercises if they don't already exist
INSERT INTO public.exercises (slug, name, primary_muscle, category, equipment, is_compound)
VALUES 
  ('wrist-curl', 'Wrist Curl', 'forearms', 'accessory', 'barbell', false),
  ('reverse-wrist-curl', 'Reverse Wrist Curl', 'forearms', 'accessory', 'barbell', false)
ON CONFLICT (slug) DO NOTHING;

-- Remove the old finisher (lateral-raise-machine)
DELETE FROM public.workout_exercises
WHERE day_id = (SELECT id FROM public.workout_days WHERE slug = 'thursday')
  AND exercise_id = (SELECT id FROM public.exercises WHERE slug = 'lateral-raise-machine');

-- Insert the Forearms Superset Finisher
INSERT INTO public.workout_exercises 
  (day_id, exercise_id, position, sets, rep_range, rep_min, rep_max, rir_target, rest_note, rest_seconds, block, notes)
VALUES 
  (
    (SELECT id FROM public.workout_days WHERE slug = 'thursday'),
    (SELECT id FROM public.exercises WHERE slug = 'wrist-curl'),
    8, 3, '15-20', 15, 20, '0', '0 sec', 0, 'finisher', 'Forearms Superset A1. Perform A1 -> immediately A2. Use controlled reps.'
  ),
  (
    (SELECT id FROM public.workout_days WHERE slug = 'thursday'),
    (SELECT id FROM public.exercises WHERE slug = 'reverse-wrist-curl'),
    9, 3, '15-20', 15, 20, '0', '45-60 sec', 60, 'finisher', 'Forearms Superset A2. Rest 45-60s after each superset. On final set, go close to failure.'
  );
