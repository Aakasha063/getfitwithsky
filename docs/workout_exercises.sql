--
-- PostgreSQL database dump
--

\restrict 8WUNP2hTTGdUl97OfaB360yKc3cN0rZTwcBpCMTyCUn8wEJZZugun08cAAnXXlg

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
-- Data for Name: workout_exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workout_exercises (id, day_id, exercise_id, "position", sets, rep_range, rep_min, rep_max, rir_target, rest_note, rest_seconds, block, notes) FROM stdin;
384988ea-7135-48b2-8d91-ba1618255a11	4dcbaf8b-f296-4a15-ae4e-a97441646067	982a0879-5e4f-42f4-b58f-5099de3507ce	8	1	15-20 min	\N	\N	\N	\N	0	\N	Moderate intensity. Breathing harder but still able to speak in short sentences.
d455a40e-2312-4d50-aefc-d6eb5b7dcf1b	4dcbaf8b-f296-4a15-ae4e-a97441646067	8fa3708c-f14f-4f77-88ce-b3555bbc99af	7	3	10-12 / side	10	12	1-2	60 sec	60	\N	\N
f624ab98-53ef-4b7c-aecd-73b1c562a640	4dcbaf8b-f296-4a15-ae4e-a97441646067	ec83dc53-1398-4d2c-b90d-2c4610aa7e49	6	3	12-15	12	15	0-1	60-90 sec	75	\N	\N
67c98468-e660-4cd4-be40-e25491a6bdf4	4dcbaf8b-f296-4a15-ae4e-a97441646067	a99a8d4e-507f-4e69-919c-4d2b6f1ad86e	5	3	10-12	10	12	0-1	60-90 sec	75	\N	\N
1b7a8fb1-9a57-486f-b922-7ae52a8585cd	4dcbaf8b-f296-4a15-ae4e-a97441646067	f21231e0-3b85-4604-9b23-f9d37d399d65	4	3	12-15	12	15	0-1	60-90 sec	75	\N	\N
d2e139ab-efb8-4fe9-b09f-9b66a05fa088	4dcbaf8b-f296-4a15-ae4e-a97441646067	b0bface7-5949-43bc-b105-0cb93d7657fc	3	4	12-15	12	15	0-1	60-90 sec	75	\N	\N
729dc8ff-c4d0-4661-bd29-d65402f228a0	4dcbaf8b-f296-4a15-ae4e-a97441646067	6db961ec-fe29-4e96-b8e3-e37f36b85cab	2	3	8-12	8	12	1-2	2 min	120	\N	Starting weight: ~75 kg
695a2888-8aef-4d26-b7d5-f1514bbffa8b	4dcbaf8b-f296-4a15-ae4e-a97441646067	cb07506b-1629-425c-858f-092ac50d3132	1	4	8-10	8	10	1-2	2-3 min	180	\N	Starting weight: ~60 kg
a789379a-2ce2-439e-8273-df87ed386166	a978c9e1-416f-4464-a207-51c526287348	4864bcd3-ac45-48fc-b9af-2cc15556bfcc	6	3	8-12	8	12	0-1	90 sec	90	\N	Starting weight: ~15 kg
e0c71fed-d512-4a0b-b8d2-075808f403cd	a978c9e1-416f-4464-a207-51c526287348	7f86b3b1-d33e-464c-8c04-86a5f61de0f1	5	2	15-20	15	20	0-1	60 sec	60	\N	\N
15001c2e-bc33-464a-b0cb-1aa6dcf2de8b	a978c9e1-416f-4464-a207-51c526287348	64fc2b70-491f-4abf-a231-18c4631f57a8	4	4	12-15	12	15	0-1	60-90 sec	75	\N	Starting weight: ~55 kg
a8efbdc5-491e-4843-b6f6-977f03b13e94	a978c9e1-416f-4464-a207-51c526287348	caa90bf6-0e87-4962-8342-0156731af321	3	3	12-15	12	15	0-1	60-90 sec	75	\N	Starting weight: ~45 kg
9cb1b808-f2f9-49fa-aa63-9f55c91af421	a978c9e1-416f-4464-a207-51c526287348	5bcb35df-7c2d-4628-b6dc-7ce883a5ad53	2	4	8-12	8	12	1-2	2 min	120	\N	Starting weight: ~40 kg
9c04e47f-200d-4325-b5fd-c77cbcea1284	a978c9e1-416f-4464-a207-51c526287348	9851fd78-07da-4a45-ad50-077b1396b1be	1	4	8-10	8	10	1-2	2-3 min	180	\N	Use a weight appropriate for the machine
40b6c17d-ae42-466b-96e1-c80fe2ecbc56	b12f6719-e361-4ba5-9098-83041ef7eb0b	e59803b7-57be-4539-ba4e-714220e8a369	7	2	10-12	10	12	0-1	60-90 sec	75	\N	\N
6b12500a-e56b-4605-b372-dd3d12565a09	b12f6719-e361-4ba5-9098-83041ef7eb0b	ce51a877-1fe3-49ca-b7a1-cb4a395db4a9	5	3	10-12	10	12	0-1	60-90 sec	75	\N	Starting point: ~12.5 kg EZ-bar load or equivalent
9eba2e11-befe-4f63-bf80-ec628426d7c0	b12f6719-e361-4ba5-9098-83041ef7eb0b	0132c471-e57c-4d7a-b379-555b0c2ac506	4	3	10-12	10	12	0-1	60-90 sec	75	\N	\N
3b4831b1-e0b5-4615-8a96-d0afb0face26	b12f6719-e361-4ba5-9098-83041ef7eb0b	4518aa4b-304f-4cba-a14e-b060f69c8fa8	3	3	15-20	15	20	0-1	60-90 sec	75	\N	\N
69a60ab8-783a-450d-b21c-fce5eccb71e8	b12f6719-e361-4ba5-9098-83041ef7eb0b	4ab9e5f4-ebc6-4902-b4b6-404097741b79	2	4	12-15	12	15	0-1	60-90 sec	75	\N	\N
51e907b1-b813-4314-ab57-1cf75d43bfe5	b12f6719-e361-4ba5-9098-83041ef7eb0b	fb28391f-5ebd-43b1-b3da-dbc5b424c91a	1	4	8-10	8	10	1-2	2-3 min	180	\N	Starting weight: ~35 kg
f5cb0129-d458-4dc8-abe4-984ad83ac52d	b12f6719-e361-4ba5-9098-83041ef7eb0b	a99a8d4e-507f-4e69-919c-4d2b6f1ad86e	6	3	12-15	12	15	0-1	60-90 sec	75	\N	\N
5e7bcdaa-ba0e-4f92-b414-25fe53df0fe9	b12f6719-e361-4ba5-9098-83041ef7eb0b	b0bface7-5949-43bc-b105-0cb93d7657fc	8	2	15-20	15	20	0-1	60 sec	60	\N	Finisher — final set can be a controlled drop set.
6391fd85-cae0-4a88-87bd-1b43476bdd04	5df4b661-92a2-48e2-a2d0-14c770235c8b	982a0879-5e4f-42f4-b58f-5099de3507ce	6	1	15-20 min	\N	\N	\N	\N	0	\N	\N
55519651-9ede-4f35-b107-74441772d601	5df4b661-92a2-48e2-a2d0-14c770235c8b	e5c60e5c-6494-48a4-9a7e-9b9defc75f3d	1	3	8-10	8	10	1-2	2-3 min	180	\N	\N
e0d08e50-dbff-4410-9ec5-dda5dc4fa04b	5df4b661-92a2-48e2-a2d0-14c770235c8b	4ab9e5f4-ebc6-4902-b4b6-404097741b79	2	4	12-15	12	15	0-1	60-90 sec	75	\N	\N
20d1865a-70c3-4b91-9384-8d4e949593fe	5df4b661-92a2-48e2-a2d0-14c770235c8b	7f86b3b1-d33e-464c-8c04-86a5f61de0f1	5	3	15-20	15	20	0-1	60 sec	60	\N	\N
9e6c18e5-0dcf-4672-960d-78983c396111	5df4b661-92a2-48e2-a2d0-14c770235c8b	64fc2b70-491f-4abf-a231-18c4631f57a8	4	4	15-20	15	20	0-1	60-90 sec	75	\N	\N
290e8594-212c-48dc-9673-4354482db37c	5df4b661-92a2-48e2-a2d0-14c770235c8b	b0bface7-5949-43bc-b105-0cb93d7657fc	3	3	15-20	15	20	0-1	60-90 sec	75	\N	\N
ed4b65c0-d7af-44db-afbb-c2cb517ada46	d7ce929c-06a9-42a6-a385-5715f453668d	982a0879-5e4f-42f4-b58f-5099de3507ce	6	1	15-20 min	\N	\N	\N	\N	0	\N	\N
6799b22d-6a8e-41db-a46a-b4851a329677	d7ce929c-06a9-42a6-a385-5715f453668d	c1f8d4e0-9691-4143-9833-ae1f27b7cc17	1	4	6-10	6	10	1-2	2-3 min	180	\N	\N
07fc1bc2-7e3a-457a-a8aa-c226edcabb07	d7ce929c-06a9-42a6-a385-5715f453668d	10933878-e0d9-42d9-9ce1-fae93b2d78b8	2	4	8-12	8	12	1-2	2 min	120	\N	\N
ed12a734-78a9-4359-93d9-0e2ab18f9065	d7ce929c-06a9-42a6-a385-5715f453668d	64fc2b70-491f-4abf-a231-18c4631f57a8	5	3	15-20	15	20	0-1	60-90 sec	75	\N	\N
2193f405-1241-4dac-af2e-cbd5f9ab9bde	d7ce929c-06a9-42a6-a385-5715f453668d	caa90bf6-0e87-4962-8342-0156731af321	4	3	12-15	12	15	0-1	60-90 sec	75	\N	\N
10124b06-e08c-45d3-80fc-e12b7c061c56	d7ce929c-06a9-42a6-a385-5715f453668d	5bcb35df-7c2d-4628-b6dc-7ce883a5ad53	3	3	8-12	8	12	1-2	2 min	120	\N	\N
64e4150f-f61b-421e-8e50-0c01ba856e85	fea30e10-1b4a-48f7-9146-7f3f6130e1cd	982a0879-5e4f-42f4-b58f-5099de3507ce	7	1	15-20 min	\N	\N	\N	\N	0	\N	\N
ac4be20f-b377-4abe-859a-984a893d7ea4	fea30e10-1b4a-48f7-9146-7f3f6130e1cd	b2c96b9f-39b7-4f5d-a4b2-abe1702f5fc2	1	3	8-10	8	10	1-2	90 sec	90	\N	\N
95a90736-db0c-4b2c-858e-339a3dd47b29	fea30e10-1b4a-48f7-9146-7f3f6130e1cd	e59803b7-57be-4539-ba4e-714220e8a369	3	3	10-12	10	12	0-1	60-90 sec	75	\N	\N
7b77c99d-8aa5-40be-81ae-615fbb472e6e	fea30e10-1b4a-48f7-9146-7f3f6130e1cd	0132c471-e57c-4d7a-b379-555b0c2ac506	4	3	8-10	8	10	1-2	90 sec	90	\N	\N
0f6b41b0-d548-402e-bf7d-0d434c87be23	fea30e10-1b4a-48f7-9146-7f3f6130e1cd	4864bcd3-ac45-48fc-b9af-2cc15556bfcc	2	3	10-12	10	12	0-1	90 sec	90	\N	\N
d1288e9c-bb4f-4fcf-96f0-58d604bd493d	fea30e10-1b4a-48f7-9146-7f3f6130e1cd	ec83dc53-1398-4d2c-b90d-2c4610aa7e49	5	3	10-15	10	15	0-1	60-90 sec	75	\N	\N
7ccfdcc7-8ef8-409e-9702-a40ad47e544d	fea30e10-1b4a-48f7-9146-7f3f6130e1cd	a99a8d4e-507f-4e69-919c-4d2b6f1ad86e	6	3	12-15	12	15	0-1	60-90 sec	75	\N	\N
01e3f4f3-275b-4898-9b6c-516271bbe980	609ec1b9-5ea1-4f4f-b088-62fc56082a4f	982a0879-5e4f-42f4-b58f-5099de3507ce	6	1	15-20 min	\N	\N	\N	\N	0	\N	\N
9d79e253-c088-4c9a-a2b6-b1e3d35ba7a7	609ec1b9-5ea1-4f4f-b088-62fc56082a4f	6a66925f-b4a5-4fb0-ac77-17d46cbfbb4d	5	2	Stop ~1 rep before failure	\N	\N	1	60-90 sec	75	\N	\N
3fc5f3dc-605f-472c-add8-a04a53ba835d	609ec1b9-5ea1-4f4f-b088-62fc56082a4f	890b8c33-d79c-4dab-bb29-5d67244eb711	4	3	8-10	8	10	1-2	2 min	120	\N	\N
ca69973c-2280-417d-9caf-3eea177c1b71	609ec1b9-5ea1-4f4f-b088-62fc56082a4f	42d4c83a-f092-47b8-b0a5-92b1e32d39f7	1	4	8-10	8	10	1-2	2-3 min	180	\N	\N
c05553c1-f355-45af-9a87-8220b4caa938	609ec1b9-5ea1-4f4f-b088-62fc56082a4f	486498b6-0887-4735-a5b9-318d5c448874	3	3	12-15	12	15	0-1	60-90 sec	75	\N	\N
dfe848e5-082b-4b76-b983-7fd82ae0652c	609ec1b9-5ea1-4f4f-b088-62fc56082a4f	f21231e0-3b85-4604-9b23-f9d37d399d65	2	3	12-15	12	15	0-1	60-90 sec	75	\N	\N
20e7ef92-f621-4a10-ab13-d43d36941a66	d3a70388-5f01-4df9-9d62-9fd23d2836ed	9ec3e3a5-e0db-4c6c-8cf2-e07831091dd9	7	3	8-10 / side	8	10	1-2	60 sec	60	\N	Start unweighted if necessary. Focus on a controlled trunk position while moving the limbs.
62ab592d-4c68-4601-a376-4cb8d7c4862e	d3a70388-5f01-4df9-9d62-9fd23d2836ed	982a0879-5e4f-42f4-b58f-5099de3507ce	8	1	20 min	\N	\N	\N	\N	0	\N	\N
2a431573-f489-4a2a-87c3-da9fc41cb33e	d3a70388-5f01-4df9-9d62-9fd23d2836ed	8adae13f-fcf8-4de3-9dd3-317e4efa4e88	6	4	12-15	12	15	0-1	60-90 sec	75	\N	\N
5432b490-6ea9-4423-ab62-148ac9095f8c	d3a70388-5f01-4df9-9d62-9fd23d2836ed	8525ccdd-f1ce-4868-921b-1ea953365500	5	3	12-15	12	15	0-1	60-90 sec	75	\N	\N
2b0382ea-5d7c-4ab3-b43e-16b18197ec17	d3a70388-5f01-4df9-9d62-9fd23d2836ed	91e90c0f-9b65-4614-acd1-299bcdc83fc3	4	3	8-10 / leg	8	10	1-2	90-120 sec	105	\N	Starting weight: ~15 kg
ef799a9e-98fc-47c6-a7a6-5f17ff63a90c	d3a70388-5f01-4df9-9d62-9fd23d2836ed	c73065c9-cfc2-4b47-b96e-a2ea51271b7a	3	4	10-12	10	12	0-1	90 sec	90	\N	Controlled eccentric
b3b175f9-e456-4410-9f40-4338b0c18dce	d3a70388-5f01-4df9-9d62-9fd23d2836ed	444c4727-1be9-4be6-a9f6-565a18283bf1	2	3	8-10	8	10	1-2	2-3 min	180	\N	Starting weight: ~50 kg. Keep the pelvis controlled. Do not chase depth if your lower back starts rounding.
cdc7b925-c9eb-48b6-b29c-f3dbdf0e404c	d3a70388-5f01-4df9-9d62-9fd23d2836ed	80e0900f-c21a-40c7-a20f-632769eab30b	1	4	8-12	8	12	1-2	2-3 min	180	\N	Starting weight: ~150 kg
e026101c-23be-4fa5-81a4-dc8b682084f9	da2c48b5-fc0e-45ff-9857-61211888f6f1	982a0879-5e4f-42f4-b58f-5099de3507ce	9	1	20 min	\N	\N	\N	\N	0	\N	\N
5869dcb2-8244-4026-b560-ff42d0244a24	da2c48b5-fc0e-45ff-9857-61211888f6f1	fbf0ad46-e549-4dcf-9b5f-f102b4657ba0	5	3	8-12	8	12	1-2	2 min	120	\N	Controlled reps. Keep ribs down and avoid excessive lower-back extension.
9d4e85a6-ce05-4696-9c6d-3ec39d795dc3	da2c48b5-fc0e-45ff-9857-61211888f6f1	486498b6-0887-4735-a5b9-318d5c448874	3	3	12-15	12	15	0-1	60-90 sec	75	\N	\N
65ac9b00-8cbd-4a90-840b-50ccfd727f07	da2c48b5-fc0e-45ff-9857-61211888f6f1	10933878-e0d9-42d9-9ce1-fae93b2d78b8	2	4	8-10	8	10	1-2	2 min	120	\N	\N
00752111-7307-4c09-982a-2b45831fd95a	da2c48b5-fc0e-45ff-9857-61211888f6f1	dbe692d8-5484-4d52-9ab2-c23d4999fc19	1	3	8-10	8	10	1-2	2-3 min	180	\N	Starting weight: ~35 kg
8dca3ca3-89c6-46b1-bc87-bd57073c7452	da2c48b5-fc0e-45ff-9857-61211888f6f1	8adae13f-fcf8-4de3-9dd3-317e4efa4e88	7	4	12-15	12	15	0-1	60-90 sec	75	\N	\N
131fefbe-cb8d-484b-a653-82a71e5fc674	da2c48b5-fc0e-45ff-9857-61211888f6f1	5bcb35df-7c2d-4628-b6dc-7ce883a5ad53	4	3	8-12	8	12	1-2	2 min	120	\N	\N
55115245-e2af-4bd0-b1dd-e26fa60a67d1	da2c48b5-fc0e-45ff-9857-61211888f6f1	8fa3708c-f14f-4f77-88ce-b3555bbc99af	8	3	10-12 / side	10	12	1-2	60 sec	60	\N	\N
af327ae2-aae9-4c87-8893-4ffbf5f229ff	da2c48b5-fc0e-45ff-9857-61211888f6f1	b0bface7-5949-43bc-b105-0cb93d7657fc	6	3	15-20	15	20	0-1	60-90 sec	75	\N	Use a lighter weight than Monday
\.


--
-- PostgreSQL database dump complete
--

\unrestrict 8WUNP2hTTGdUl97OfaB360yKc3cN0rZTwcBpCMTyCUn8wEJZZugun08cAAnXXlg

