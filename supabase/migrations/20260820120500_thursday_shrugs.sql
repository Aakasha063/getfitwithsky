-- Insert the shrug exercise if it doesn't already exist
INSERT INTO public.exercises (
  slug, name, primary_muscle, category, equipment, is_compound,
  cues, common_mistakes, execution
)
VALUES (
  'dumbbell-or-barbell-shrug', 
  'Dumbbell/Barbell Shrug', 
  'traps', 
  'accessory', 
  'dumbbell/barbell', 
  false,
  ARRAY['Drive shoulders straight up, not rolling them.', 'Hold the top for 1–2 seconds.', 'Controlled lowering.'],
  ARRAY['Rolling the shoulders.', 'Using momentum instead of a controlled squeeze.', 'Looking up/straining the neck.'],
  ARRAY['Stand tall with a challenging weight.', 'Drive the shoulders straight up toward your ears.', 'Hold the contraction at the top.', 'Lower slowly and under control.']
)
ON CONFLICT (slug) DO NOTHING;

-- Remove rear-delt-cable-fly from Thursday
DELETE FROM public.workout_exercises
WHERE day_id = (SELECT id FROM public.workout_days WHERE slug = 'thursday')
  AND exercise_id = (SELECT id FROM public.exercises WHERE slug = 'rear-delt-cable-fly');

-- Insert Shrugs at position 3
INSERT INTO public.workout_exercises 
  (day_id, exercise_id, position, sets, rep_range, rep_min, rep_max, rir_target, rest_note, rest_seconds, block, notes)
VALUES 
  (
    (SELECT id FROM public.workout_days WHERE slug = 'thursday'),
    (SELECT id FROM public.exercises WHERE slug = 'dumbbell-or-barbell-shrug'),
    3, 3, '10-15', 10, 15, '0-1', '60-90 sec', 75, 'accessory', 'Use a challenging weight while keeping your neck relaxed. Hold top for 1-2s.'
  );
