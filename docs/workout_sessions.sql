--
-- PostgreSQL database dump
--

\restrict UqzKHBEGBhdkEIVbiGgVVVz5fY6V2WmWPibNtrrAzsKZEzZtudsl54d8PPo1sus

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
-- Data for Name: workout_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workout_sessions (id, user_id, day_id, title, session_date, status, started_at, finished_at, duration_seconds, paused_seconds, mood, energy, difficulty, notes, is_deload, created_at, updated_at) FROM stdin;
3f632d04-ac4b-43f8-a97d-b90b81d40027	cb1df7de-189c-41f5-a1b7-0483a54c9ff5	b12f6719-e361-4ba5-9098-83041ef7eb0b	Thursday — Shoulders + Arms	2026-08-13	in_progress	2026-08-13 09:56:56.834363+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-13 09:56:56.834363+00	2026-08-13 09:56:56.834363+00
bce8d4c5-bb15-43b1-be10-1eb3f68d63eb	cb1df7de-189c-41f5-a1b7-0483a54c9ff5	5df4b661-92a2-48e2-a2d0-14c770235c8b	Saturday - Shoulders — Optional Specialization: Shoulders	2026-08-13	in_progress	2026-08-13 10:11:41.082303+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-13 10:11:41.082303+00	2026-08-13 10:11:41.082303+00
8744dbbd-3386-40f8-a01a-6f1201ff6ff4	cb1df7de-189c-41f5-a1b7-0483a54c9ff5	a978c9e1-416f-4464-a207-51c526287348	Tuesday — Back Width + Rear Delts + Biceps	2026-08-14	in_progress	2026-08-14 06:37:05.151584+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-14 06:37:05.151584+00	2026-08-14 06:37:05.151584+00
1418eee3-3de8-4572-b865-61984be64607	cb1df7de-189c-41f5-a1b7-0483a54c9ff5	d3a70388-5f01-4df9-9d62-9fd23d2836ed	Wednesday — Legs + Abs + Cardio	2026-08-14	in_progress	2026-08-14 06:37:37.437932+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-14 06:37:37.437932+00	2026-08-14 06:37:37.437932+00
67ae5c1c-1e53-466d-ae1c-7dbe2161a679	cb1df7de-189c-41f5-a1b7-0483a54c9ff5	da2c48b5-fc0e-45ff-9857-61211888f6f1	Friday — Upper + Posterior Chain + Abs + Cardio	2026-08-14	in_progress	2026-08-14 06:38:50.113607+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-14 06:38:50.113607+00	2026-08-14 06:38:50.113607+00
93891774-32cc-47a6-bb5f-86e74ea39346	b49ebb2a-6d6e-40fc-9caa-7d51cfe52d2f	d3a70388-5f01-4df9-9d62-9fd23d2836ed	Wednesday — Legs + Core + Cardio	2026-08-14	in_progress	2026-08-14 14:52:00.881145+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-14 14:52:00.881145+00	2026-08-14 14:52:00.881145+00
b6bcc3bd-5a62-4ff5-9dd4-9a43a33f694e	3d9b618f-0054-461e-aa5d-f6551bbcea96	4dcbaf8b-f296-4a15-ae4e-a97441646067	Monday — Chest + Side Delts + Triceps	2026-08-16	in_progress	2026-08-16 17:45:17.201111+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-16 17:45:17.201111+00	2026-08-16 17:45:17.201111+00
62da9976-d532-43a6-aa75-c599007e5aac	b49ebb2a-6d6e-40fc-9caa-7d51cfe52d2f	da2c48b5-fc0e-45ff-9857-61211888f6f1	Friday — Upper + Posterior Chain + Core + Cardio	2026-08-16	in_progress	2026-08-16 17:45:29.22273+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-16 17:45:29.22273+00	2026-08-16 17:45:29.22273+00
1c7a5c5e-d956-45d6-8e6d-eb45748b81be	7d507113-f400-45ce-9618-2bd079b4445d	4dcbaf8b-f296-4a15-ae4e-a97441646067	Monday — Chest + Side Delts + Triceps	2026-08-17	in_progress	2026-08-17 05:31:49.676214+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-17 05:31:49.676214+00	2026-08-17 05:31:49.676214+00
eecaf369-6467-4c85-888d-a4b51bf0fcac	43db9f06-01c9-4d14-9fc6-c01f6b25761f	4dcbaf8b-f296-4a15-ae4e-a97441646067	Monday — Chest + Side Delts + Triceps	2026-08-17	completed	2026-08-17 11:22:59.379872+00	2026-08-17 13:40:08.25+00	683	0	\N	\N	\N	\N	f	2026-08-17 11:22:59.379872+00	2026-08-17 13:40:08.927523+00
d5cfde0e-80dc-4c28-bff3-c938dee49e95	43db9f06-01c9-4d14-9fc6-c01f6b25761f	4dcbaf8b-f296-4a15-ae4e-a97441646067	Monday — Chest + Side Delts + Triceps	2026-08-17	in_progress	2026-08-17 13:40:15.225819+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-17 13:40:15.225819+00	2026-08-17 13:40:15.225819+00
1f03a77b-1fa5-41e7-bb4b-4f2b41362d8a	eef54a00-fad7-4e80-b83b-eeff68c3807f	4dcbaf8b-f296-4a15-ae4e-a97441646067	Monday — Chest + Side Delts + Triceps	2026-08-17	in_progress	2026-08-17 18:04:17.097308+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-17 18:04:17.097308+00	2026-08-17 18:04:17.097308+00
770e8a5f-9947-43e8-924e-0bcc6f86a739	eef54a00-fad7-4e80-b83b-eeff68c3807f	a978c9e1-416f-4464-a207-51c526287348	Tuesday — Back Width + Rear Delts + Biceps	2026-08-17	in_progress	2026-08-17 18:15:22.303849+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-17 18:15:22.303849+00	2026-08-17 18:15:22.303849+00
df9d3eba-9347-4176-b92e-9cf5a1fb391c	eef54a00-fad7-4e80-b83b-eeff68c3807f	b12f6719-e361-4ba5-9098-83041ef7eb0b	Thursday — Shoulders + Arms	2026-08-17	in_progress	2026-08-17 18:15:47.989339+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-17 18:15:47.989339+00	2026-08-17 18:15:47.989339+00
0ace62e0-3bed-443e-92ee-aafd0aba5185	43db9f06-01c9-4d14-9fc6-c01f6b25761f	5df4b661-92a2-48e2-a2d0-14c770235c8b	Saturday - Shoulders — Optional Specialization: Shoulders	2026-08-17	in_progress	2026-08-17 18:16:52.974446+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-17 18:16:52.974446+00	2026-08-17 18:16:52.974446+00
c02db910-2eb0-47f2-a6f3-4b95dd227c28	43db9f06-01c9-4d14-9fc6-c01f6b25761f	a978c9e1-416f-4464-a207-51c526287348	Tuesday — Back Width + Rear Delts + Biceps	2026-08-18	in_progress	2026-08-18 05:55:42.507845+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-18 05:55:42.507845+00	2026-08-18 05:55:42.507845+00
296bc519-76a0-48eb-88cb-e5718682513c	cb1df7de-189c-41f5-a1b7-0483a54c9ff5	4dcbaf8b-f296-4a15-ae4e-a97441646067	Monday — Chest + Side Delts + Triceps	2026-08-17	completed	2026-08-13 10:09:36.895923+00	2026-08-17 13:33:59.175+00	65	0	\N	\N	\N	\N	f	2026-08-13 10:09:36.895923+00	2026-08-18 06:16:07.386699+00
c0e167e8-ccb3-44b6-aa5b-a82a8a40fede	b49ebb2a-6d6e-40fc-9caa-7d51cfe52d2f	4dcbaf8b-f296-4a15-ae4e-a97441646067	Monday — Chest + Side Delts + Triceps	2026-08-17	completed	2026-08-14 14:49:02.645902+00	2026-08-17 13:37:59.605+00	4	0	\N	\N	\N	\N	f	2026-08-14 14:49:02.645902+00	2026-08-18 06:16:07.386699+00
174bbd70-fa7d-44a2-85d3-8e8a169021c8	cb1df7de-189c-41f5-a1b7-0483a54c9ff5	4dcbaf8b-f296-4a15-ae4e-a97441646067	Monday — Chest + Side Delts + Triceps	2026-08-18	in_progress	2026-08-18 06:24:43.268+00	\N	\N	0	\N	\N	\N	\N	f	2026-08-17 13:34:11.38605+00	2026-08-18 06:24:43.489971+00
\.


--
-- PostgreSQL database dump complete
--

\unrestrict UqzKHBEGBhdkEIVbiGgVVVz5fY6V2WmWPibNtrrAzsKZEzZtudsl54d8PPo1sus

