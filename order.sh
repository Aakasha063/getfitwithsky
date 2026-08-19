#!/bin/bash
awk -v RS='\\.\\n\\n' '{print $0"\\.\\n\\n"}' docs/dump.sql > blocks.txt
grep "COPY public.profiles " blocks.txt > data_ordered.sql
grep "COPY public.exercises " blocks.txt >> data_ordered.sql
grep "COPY public.workout_templates " blocks.txt >> data_ordered.sql
grep "COPY public.workout_days " blocks.txt >> data_ordered.sql
grep "COPY public.workout_exercises " blocks.txt >> data_ordered.sql
grep "COPY public.workout_sessions " blocks.txt >> data_ordered.sql
grep "COPY public.exercise_sessions " blocks.txt >> data_ordered.sql
grep "COPY public.sets " blocks.txt >> data_ordered.sql
grep "COPY public.personal_records " blocks.txt >> data_ordered.sql
grep "COPY public.cardio_sessions " blocks.txt >> data_ordered.sql
grep "COPY public.body_metrics " blocks.txt >> data_ordered.sql
grep "COPY public.exercise_notes " blocks.txt >> data_ordered.sql
