--
-- PostgreSQL database dump
--

\restrict tNMoTErpBGlAupa69mhXW7gE15nEJj0VshH9EZuGzEf4Bn2yg7ZIULXCf3G8KrZ

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: workout_days; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workout_days (id, template_id, slug, day_of_week, name, focus, is_optional, is_rest, specialization, estimated_minutes_min, estimated_minutes_max, cardio_note, notes, sort_order) FROM stdin;
4dcbaf8b-f296-4a15-ae4e-a97441646067	b79deff5-bb09-43b6-af01-63f46b806cda	monday	1	Monday	Chest + Side Delts + Triceps	f	f	\N	60	75	Incline treadmill walk 15-20 min	\N	1
a978c9e1-416f-4464-a207-51c526287348	b79deff5-bb09-43b6-af01-63f46b806cda	tuesday	2	Tuesday	Back Width + Rear Delts + Biceps	f	f	\N	60	75	\N	\N	2
b12f6719-e361-4ba5-9098-83041ef7eb0b	b79deff5-bb09-43b6-af01-63f46b806cda	thursday	4	Thursday	Shoulders + Arms	f	f	\N	55	70	\N	Final lateral raise set can be a controlled drop set.	4
5df4b661-92a2-48e2-a2d0-14c770235c8b	b79deff5-bb09-43b6-af01-63f46b806cda	saturday-shoulders	6	Saturday - Shoulders	Optional Specialization: Shoulders	t	f	shoulders	40	55	15-20 min incline walk	Weeks 1, 4 and 7 of the rotation.	6
d7ce929c-06a9-42a6-a385-5715f453668d	b79deff5-bb09-43b6-af01-63f46b806cda	saturday-back	6	Saturday - Back	Optional Specialization: Back	t	f	back	40	55	15-20 min incline walk	Weeks 2, 5 and 8 of the rotation.	7
fea30e10-1b4a-48f7-9146-7f3f6130e1cd	b79deff5-bb09-43b6-af01-63f46b806cda	saturday-arms	6	Saturday - Arms	Optional Specialization: Arms	t	f	arms	40	55	15-20 min incline walk	Week 3 of the rotation.	8
609ec1b9-5ea1-4f4f-b088-62fc56082a4f	b79deff5-bb09-43b6-af01-63f46b806cda	saturday-chest	6	Saturday - Chest	Optional Specialization: Chest	t	f	chest	40	55	15-20 min incline walk	Week 6 of the rotation.	9
78bab72b-7326-40b2-b929-04d191f106d0	b79deff5-bb09-43b6-af01-63f46b806cda	sunday	0	Sunday	Complete Rest	f	t	\N	0	0	Easy walking only	Easy walking, light mobility, stretching if desired. No hard training, no HIIT.	10
d3a70388-5f01-4df9-9d62-9fd23d2836ed	b79deff5-bb09-43b6-af01-63f46b806cda	wednesday	3	Wednesday	Legs + Core + Cardio	f	f	\N	65	80	Incline treadmill walk 20 min	\N	3
da2c48b5-fc0e-45ff-9857-61211888f6f1	b79deff5-bb09-43b6-af01-63f46b806cda	friday	5	Friday	Upper + Posterior Chain + Core + Cardio	f	f	\N	70	85	Incline treadmill walk 20 min	\N	5
\.


--
-- PostgreSQL database dump complete
--

\unrestrict tNMoTErpBGlAupa69mhXW7gE15nEJj0VshH9EZuGzEf4Bn2yg7ZIULXCf3G8KrZ

