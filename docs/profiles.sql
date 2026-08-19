--
-- PostgreSQL database dump
--

\restrict Lmgb3hABgTc235xHXnSlySiyn4PbknUNPeRZa6zOgUpKG9DVADjpDbMkGQjBkDV

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
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, name, height_cm, current_weight_kg, starting_weight_kg, date_of_birth, training_experience, primary_goal, target_weight_kg, target_body_fat, weight_unit, length_unit, preferred_cardio, rest_timer_seconds, theme, reminders_enabled, onboarding_completed, plan_start_date, created_at, updated_at) FROM stdin;
b49ebb2a-6d6e-40fc-9caa-7d51cfe52d2f	Tushar verma	\N	\N	\N	\N	\N	\N	\N	\N	kg	cm	\N	120	dark	f	f	\N	2026-08-14 07:12:48.755339+00	2026-08-14 07:12:48.755339+00
43db9f06-01c9-4d14-9fc6-c01f6b25761f	Dharshit	\N	\N	\N	\N	\N	\N	\N	\N	kg	cm	\N	120	dark	f	f	\N	2026-08-14 11:57:39.765495+00	2026-08-14 11:57:39.765495+00
3d9b618f-0054-461e-aa5d-f6551bbcea96	Tyagi	\N	\N	\N	\N	\N	\N	\N	\N	kg	cm	\N	120	dark	f	f	\N	2026-08-16 17:44:42.012016+00	2026-08-16 17:44:42.012016+00
7d507113-f400-45ce-9618-2bd079b4445d	Hemraj Verma	\N	\N	\N	\N	\N	\N	\N	\N	kg	cm	\N	120	dark	f	f	\N	2026-08-17 05:31:05.075229+00	2026-08-17 05:31:05.075229+00
cb1df7de-189c-41f5-a1b7-0483a54c9ff5	Sky	\N	\N	\N	\N	Advanced	Muscle gain	\N	\N	kg	cm	\N	120	dark	f	f	\N	2026-08-13 09:55:48.905249+00	2026-08-17 05:57:07.737525+00
eef54a00-fad7-4e80-b83b-eeff68c3807f	Sehaj	\N	\N	\N	\N	Intermediate	Muscle gain	\N	\N	kg	cm	\N	120	dark	f	f	\N	2026-08-17 18:03:53.390425+00	2026-08-17 18:14:34.354262+00
\.


--
-- PostgreSQL database dump complete
--

\unrestrict Lmgb3hABgTc235xHXnSlySiyn4PbknUNPeRZa6zOgUpKG9DVADjpDbMkGQjBkDV

