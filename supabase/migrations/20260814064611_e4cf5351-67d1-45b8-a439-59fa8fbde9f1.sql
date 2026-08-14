
INSERT INTO public.exercises (slug, name, primary_muscle, secondary_muscles, category, equipment, setup, execution, breathing, cues, common_mistakes, should_feel, lower_back_notes, default_rest_seconds, default_rir, default_rep_range, is_compound)
VALUES (
  'weighted-dead-bug', 'Weighted Dead Bug', 'core', ARRAY['hip flexors']::text[], 'core', 'dumbbell or plate',
  ARRAY['Lie on your back, knees and hips at 90 degrees.','Press your lower back gently into the floor.','Hold a light weight over your chest, or start unweighted.']::text[],
  ARRAY['Extend one leg and the opposite arm slowly.','Stop before your lower back lifts off the floor.','Return under control and switch sides.']::text[],
  'Exhale as the limbs extend, inhale on the return.',
  ARRAY['Ribs down, pelvis tucked.','Move slowly — position beats range of motion.']::text[],
  ARRAY['Letting the lower back arch off the floor.','Rushing reps.']::text[],
  'Deep tension across the front of the abdominal wall.',
  'Keep the lumbar spine flat; reduce range before allowing extension.',
  60, '1-2', '8-10 / side', false
) ON CONFLICT (slug) DO NOTHING;

UPDATE public.workout_days SET focus='Legs + Core + Cardio', cardio_note='Incline treadmill walk 20 min' WHERE slug='wednesday';
UPDATE public.workout_days SET focus='Upper + Posterior Chain + Core + Cardio' WHERE slug='friday';

UPDATE public.exercise_sessions SET workout_exercise_id = NULL;
DELETE FROM public.workout_exercises;

INSERT INTO public.workout_exercises (day_id, exercise_id, position, sets, rep_range, rep_min, rep_max, rir_target, rest_note, rest_seconds, notes)
SELECT d.id, e.id, v.position, v.sets, v.rep_range, v.rep_min, v.rep_max, v.rir_target, v.rest_note, v.rest_seconds, v.notes
FROM (VALUES
  ('monday','incline-smith-press',1,4,'8-10',8,10,'1-2','2-3 min',180,'Starting weight: ~60 kg'),
  ('monday','flat-machine-chest-press',2,3,'8-12',8,12,'1-2','2 min',120,'Starting weight: ~75 kg'),
  ('monday','lateral-raise-machine',3,4,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('monday','pec-deck',4,3,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('monday','overhead-cable-triceps-extension',5,3,'10-12',10,12,'0-1','60-90 sec',75,NULL),
  ('monday','rope-pushdown',6,3,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('monday','pallof-press',7,3,'10-12 / side',10,12,'1-2','60 sec',60,NULL),
  ('monday','incline-treadmill-walk',8,1,'15-20 min',NULL,NULL,NULL,NULL,0,'Moderate intensity. Breathing harder but still able to speak in short sentences.'),

  ('tuesday','wide-grip-lat-pulldown',1,4,'8-10',8,10,'1-2','2-3 min',180,'Use a weight appropriate for the machine'),
  ('tuesday','chest-supported-row',2,4,'8-12',8,12,'1-2','2 min',120,'Starting weight: ~40 kg'),
  ('tuesday','straight-arm-pulldown',3,3,'12-15',12,15,'0-1','60-90 sec',75,'Starting weight: ~45 kg'),
  ('tuesday','rear-delt-fly',4,4,'12-15',12,15,'0-1','60-90 sec',75,'Starting weight: ~55 kg'),
  ('tuesday','face-pull',5,2,'15-20',15,20,'0-1','60 sec',60,NULL),
  ('tuesday','incline-dumbbell-curl',6,3,'8-12',8,12,'0-1','90 sec',90,'Starting weight: ~15 kg'),

  ('wednesday','leg-press',1,4,'8-12',8,12,'1-2','2-3 min',180,'Starting weight: ~150 kg'),
  ('wednesday','smith-hack-squat',2,3,'8-10',8,10,'1-2','2-3 min',180,'Starting weight: ~50 kg. Keep the pelvis controlled. Do not chase depth if your lower back starts rounding.'),
  ('wednesday','leg-curl',3,4,'10-12',10,12,'0-1','90 sec',90,'Controlled eccentric'),
  ('wednesday','bulgarian-split-squat',4,3,'8-10 / leg',8,10,'1-2','90-120 sec',105,'Starting weight: ~15 kg'),
  ('wednesday','leg-extension',5,3,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('wednesday','standing-calf-raise',6,4,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('wednesday','weighted-dead-bug',7,3,'8-10 / side',8,10,'1-2','60 sec',60,'Start unweighted if necessary. Focus on a controlled trunk position while moving the limbs.'),
  ('wednesday','incline-treadmill-walk',8,1,'20 min',NULL,NULL,NULL,NULL,0,NULL),

  ('thursday','seated-dumbbell-shoulder-press',1,4,'8-10',8,10,'1-2','2-3 min',180,'Starting weight: ~35 kg'),
  ('thursday','cable-lateral-raise',2,4,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('thursday','rear-delt-cable-fly',3,3,'15-20',15,20,'0-1','60-90 sec',75,NULL),
  ('thursday','triceps-press-machine',4,3,'10-12',10,12,'0-1','60-90 sec',75,NULL),
  ('thursday','ez-bar-preacher-curl',5,3,'10-12',10,12,'0-1','60-90 sec',75,'Starting point: ~12.5 kg EZ-bar load or equivalent'),
  ('thursday','overhead-cable-triceps-extension',6,3,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('thursday','hammer-curl',7,2,'10-12',10,12,'0-1','60-90 sec',75,NULL),
  ('thursday','lateral-raise-machine',8,2,'15-20',15,20,'0-1','60 sec',60,'Finisher — final set can be a controlled drop set.'),

  ('friday','incline-dumbbell-press',1,3,'8-10',8,10,'1-2','2-3 min',180,'Starting weight: ~35 kg'),
  ('friday','neutral-grip-lat-pulldown',2,4,'8-10',8,10,'1-2','2 min',120,NULL),
  ('friday','cable-chest-fly',3,3,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('friday','chest-supported-row',4,3,'8-12',8,12,'1-2','2 min',120,NULL),
  ('friday','hip-thrust',5,3,'8-12',8,12,'1-2','2 min',120,'Controlled reps. Keep ribs down and avoid excessive lower-back extension.'),
  ('friday','lateral-raise-machine',6,3,'15-20',15,20,'0-1','60-90 sec',75,'Use a lighter weight than Monday'),
  ('friday','standing-calf-raise',7,4,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('friday','pallof-press',8,3,'10-12 / side',10,12,'1-2','60 sec',60,NULL),
  ('friday','incline-treadmill-walk',9,1,'20 min',NULL,NULL,NULL,NULL,0,NULL),

  ('saturday-shoulders','machine-shoulder-press',1,3,'8-10',8,10,'1-2','2-3 min',180,NULL),
  ('saturday-shoulders','cable-lateral-raise',2,4,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('saturday-shoulders','lateral-raise-machine',3,3,'15-20',15,20,'0-1','60-90 sec',75,NULL),
  ('saturday-shoulders','rear-delt-fly',4,4,'15-20',15,20,'0-1','60-90 sec',75,NULL),
  ('saturday-shoulders','face-pull',5,3,'15-20',15,20,'0-1','60 sec',60,NULL),
  ('saturday-shoulders','incline-treadmill-walk',6,1,'15-20 min',NULL,NULL,NULL,NULL,0,NULL),

  ('saturday-back','pull-ups',1,4,'6-10',6,10,'1-2','2-3 min',180,NULL),
  ('saturday-back','neutral-grip-lat-pulldown',2,4,'8-12',8,12,'1-2','2 min',120,NULL),
  ('saturday-back','chest-supported-row',3,3,'8-12',8,12,'1-2','2 min',120,NULL),
  ('saturday-back','straight-arm-pulldown',4,3,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('saturday-back','rear-delt-fly',5,3,'15-20',15,20,'0-1','60-90 sec',75,NULL),
  ('saturday-back','incline-treadmill-walk',6,1,'15-20 min',NULL,NULL,NULL,NULL,0,NULL),

  ('saturday-arms','ez-bar-curl',1,3,'8-10',8,10,'1-2','90 sec',90,NULL),
  ('saturday-arms','incline-dumbbell-curl',2,3,'10-12',10,12,'0-1','90 sec',90,NULL),
  ('saturday-arms','hammer-curl',3,3,'10-12',10,12,'0-1','60-90 sec',75,NULL),
  ('saturday-arms','triceps-press-machine',4,3,'8-10',8,10,'1-2','90 sec',90,NULL),
  ('saturday-arms','rope-pushdown',5,3,'10-15',10,15,'0-1','60-90 sec',75,NULL),
  ('saturday-arms','overhead-cable-triceps-extension',6,3,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('saturday-arms','incline-treadmill-walk',7,1,'15-20 min',NULL,NULL,NULL,NULL,0,NULL),

  ('saturday-chest','incline-machine-press',1,4,'8-10',8,10,'1-2','2-3 min',180,NULL),
  ('saturday-chest','pec-deck',2,3,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('saturday-chest','cable-chest-fly',3,3,'12-15',12,15,'0-1','60-90 sec',75,NULL),
  ('saturday-chest','weighted-chest-dips',4,3,'8-10',8,10,'1-2','2 min',120,NULL),
  ('saturday-chest','push-ups',5,2,'Stop ~1 rep before failure',NULL,NULL,'1','60-90 sec',75,NULL),
  ('saturday-chest','incline-treadmill-walk',6,1,'15-20 min',NULL,NULL,NULL,NULL,0,NULL)
) AS v(day_slug, ex_slug, position, sets, rep_range, rep_min, rep_max, rir_target, rest_note, rest_seconds, notes)
JOIN public.workout_days d ON d.slug = v.day_slug
JOIN public.exercises e ON e.slug = v.ex_slug;
