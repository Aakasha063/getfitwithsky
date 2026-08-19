--
-- PostgreSQL database dump
--

\restrict afcDk8BqL1KmSbufVwaVLmlqqApOymUEXJdns46PuxjULjWevCZQ9685mH2Rhtm

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
-- Data for Name: cardio_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cardio_sessions (id, user_id, session_id, performed_on, cardio_type, duration_minutes, distance_km, incline_percent, speed_kph, rounds, avg_heart_rate, notes, created_at) FROM stdin;
\.


--
-- PostgreSQL database dump complete
--

\unrestrict afcDk8BqL1KmSbufVwaVLmlqqApOymUEXJdns46PuxjULjWevCZQ9685mH2Rhtm

