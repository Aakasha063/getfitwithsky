--
-- PostgreSQL database dump
--

\restrict yzw1QhU2uVnqd1vwxjBm4XBV80KXsULZGP50u35W057OW8n3GGANMqhae2q4i98

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
-- Data for Name: body_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.body_metrics (id, user_id, measured_on, weight_kg, waist_cm, body_fat_percent, height_cm, chest_cm, arm_cm, thigh_cm, notes, created_at, updated_at, target_calories) FROM stdin;
b18af71c-e003-4233-be3d-7bd507b6f4f4	43db9f06-01c9-4d14-9fc6-c01f6b25761f	2026-08-17	60	81	\N	\N	\N	\N	\N	\N	2026-08-17 11:27:50.274261+00	2026-08-17 11:27:50.274261+00	\N
dde92867-ec0f-4f03-b40a-0ef1f1daac19	b49ebb2a-6d6e-40fc-9caa-7d51cfe52d2f	2026-08-17	71	\N	\N	\N	\N	\N	\N	\N	2026-08-17 13:24:45.103805+00	2026-08-17 13:24:45.103805+00	\N
ef8860d7-dffd-4023-976f-42d010bcfaa8	b49ebb2a-6d6e-40fc-9caa-7d51cfe52d2f	2026-08-17	74	\N	\N	\N	\N	\N	\N	\N	2026-08-17 13:24:47.660714+00	2026-08-17 13:24:47.660714+00	\N
161d4e38-2bfb-4f65-95df-eb36c0d9d2c5	b49ebb2a-6d6e-40fc-9caa-7d51cfe52d2f	2026-08-17	74	\N	\N	\N	\N	\N	\N	\N	2026-08-17 13:26:29.21118+00	2026-08-17 13:26:29.21118+00	\N
ac91a3ed-1de1-476b-b5df-15f680f06b8d	cb1df7de-189c-41f5-a1b7-0483a54c9ff5	2026-08-17	78	45	\N	\N	\N	\N	\N	\N	2026-08-17 13:28:28.161757+00	2026-08-17 13:28:28.161757+00	\N
41e294a2-0143-446f-93dd-8abf7c61a8ef	eef54a00-fad7-4e80-b83b-eeff68c3807f	2026-08-17	56	71	\N	\N	\N	\N	\N	\N	2026-08-17 18:05:13.327796+00	2026-08-17 18:05:13.327796+00	\N
c4a7d215-7a08-4406-9849-ffb0a4d22eb8	eef54a00-fad7-4e80-b83b-eeff68c3807f	2026-08-17	56	\N	\N	\N	\N	\N	\N	\N	2026-08-17 18:13:08.802521+00	2026-08-17 18:13:08.802521+00	2680
253a942f-791a-40e7-b22b-3826081e3d0f	eef54a00-fad7-4e80-b83b-eeff68c3807f	2026-08-17	\N	71	1.5	172.72	\N	\N	\N	\N	2026-08-17 18:13:50.652335+00	2026-08-17 18:13:50.652335+00	\N
12c5ed5e-093c-4ed8-a5cb-0212c22bd529	eef54a00-fad7-4e80-b83b-eeff68c3807f	2026-08-17	56	\N	\N	\N	\N	\N	\N	\N	2026-08-17 18:14:06.316602+00	2026-08-17 18:14:06.316602+00	2660
09eafa22-2fbd-486a-9a64-3047092f880d	cb1df7de-189c-41f5-a1b7-0483a54c9ff5	2026-08-18	\N	76.2	10.4	182.88	\N	\N	\N	\N	2026-08-17 18:30:06.491189+00	2026-08-17 18:30:06.491189+00	\N
3a3e80f9-a546-4bf1-95fd-c7b2583d0783	cb1df7de-189c-41f5-a1b7-0483a54c9ff5	2026-08-18	78	\N	\N	\N	\N	\N	\N	\N	2026-08-17 18:30:37.101996+00	2026-08-17 18:30:37.101996+00	2920
e18529b0-444f-4283-ae1e-ee90883b159b	cb1df7de-189c-41f5-a1b7-0483a54c9ff5	2026-08-18	78	30	\N	\N	\N	\N	\N	\N	2026-08-17 18:31:04.557456+00	2026-08-17 18:31:04.557456+00	\N
3e80fedc-18b8-4a4c-b7da-d6f3a8ffb60b	cb1df7de-189c-41f5-a1b7-0483a54c9ff5	2026-08-18	77.5	76	\N	\N	\N	\N	\N	\N	2026-08-18 05:50:34.922862+00	2026-08-18 05:50:34.922862+00	\N
272187f7-eb6d-4534-9405-049c0662f896	cb1df7de-189c-41f5-a1b7-0483a54c9ff5	2026-08-18	78	78	12.3	184	\N	\N	\N	\N	2026-08-18 06:03:39.689783+00	2026-08-18 06:10:21.260198+00	\N
\.


--
-- PostgreSQL database dump complete
--

\unrestrict yzw1QhU2uVnqd1vwxjBm4XBV80KXsULZGP50u35W057OW8n3GGANMqhae2q4i98

