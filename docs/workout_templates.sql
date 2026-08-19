--
-- PostgreSQL database dump
--

\restrict dz3RSaZtSM03HIOOsNu3vRd3Yj6uE16zyAWuBqEWpI4pfRDP0A1Pgb5zH3CirIk

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
-- Data for Name: workout_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workout_templates (id, slug, name, description, notes, created_at) FROM stdin;
b79deff5-bb09-43b6-af01-63f46b806cda	v-taper-fat-loss	V-Taper + Fat-Loss Phase	Monday-Friday mandatory training with an optional Saturday specialization day. Priorities: upper chest, lats, side delts, rear delts, arms.	Compounds: ~1-2 RIR, rest 2-3 min. Isolation: ~0-1 RIR on the final set, rest 60-90 sec. Double progression - work to the top of the rep range across all sets, then add weight and restart near the bottom. During a cut, maintaining strength is success. Lower-back-safe: no conventional deadlifts, no barbell back squats, no loaded RDLs.	2026-08-13 09:39:32.743585+00
\.


--
-- PostgreSQL database dump complete
--

\unrestrict dz3RSaZtSM03HIOOsNu3vRd3Yj6uE16zyAWuBqEWpI4pfRDP0A1Pgb5zH3CirIk

