INSERT INTO public.workout_days (template_id, slug, name, focus, day_of_week, sort_order, is_optional, is_rest, specialization, cardio_note, estimated_minutes_min, estimated_minutes_max, notes)
SELECT t.id, 'saturday-hiit', 'Saturday - HIIT / Conditioning', 'Optional Specialization: HIIT / Conditioning', 6, 11, true, false, 'hiit', null, 40, 50, 'Goal: Conditioning + athleticism + calorie expenditure. Move fast, have fun, finish trained not destroyed.'
FROM public.workout_templates t
WHERE t.name = 'V-Taper Fat-Loss Phase';
