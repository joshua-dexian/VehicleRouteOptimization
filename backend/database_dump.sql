--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: depots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.depots (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    address character varying(255) NOT NULL,
    capacity character varying(50),
    status character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.depots OWNER TO postgres;

--
-- Name: depots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.depots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.depots_id_seq OWNER TO postgres;

--
-- Name: depots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.depots_id_seq OWNED BY public.depots.id;


--
-- Name: driver_performance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driver_performance (
    id integer NOT NULL,
    driver_id integer NOT NULL,
    date timestamp with time zone DEFAULT now(),
    routes_completed integer,
    avg_time_per_delivery double precision,
    total_distance double precision,
    total_duration double precision,
    on_time_delivery_rate double precision,
    notes text
);


ALTER TABLE public.driver_performance OWNER TO postgres;

--
-- Name: driver_performance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driver_performance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.driver_performance_id_seq OWNER TO postgres;

--
-- Name: driver_performance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driver_performance_id_seq OWNED BY public.driver_performance.id;


--
-- Name: drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drivers (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20),
    license_number character varying(50),
    experience character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.drivers OWNER TO postgres;

--
-- Name: drivers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drivers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drivers_id_seq OWNER TO postgres;

--
-- Name: drivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drivers_id_seq OWNED BY public.drivers.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    address character varying(255) NOT NULL,
    order_number character varying(50),
    customer_name character varying(100),
    phone character varying(20),
    email character varying(100),
    notes text,
    start_time character varying(50),
    end_time character varying(50),
    duration character varying(50),
    load character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: route_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.route_analytics (
    id integer NOT NULL,
    date timestamp with time zone DEFAULT now(),
    route_history_id integer,
    planned_vs_actual_time_diff double precision,
    planned_vs_actual_distance_diff double precision,
    efficiency_score double precision,
    weather_conditions character varying(100),
    traffic_conditions character varying(100),
    meta_data json
);


ALTER TABLE public.route_analytics OWNER TO postgres;

--
-- Name: route_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.route_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.route_analytics_id_seq OWNER TO postgres;

--
-- Name: route_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.route_analytics_id_seq OWNED BY public.route_analytics.id;


--
-- Name: route_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.route_history (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    date_created timestamp with time zone DEFAULT now(),
    total_distance double precision,
    total_duration double precision,
    total_orders integer,
    driver_id integer,
    vehicle_id integer,
    depot_id integer,
    route_data json,
    actual_completion_time double precision,
    actual_distance double precision,
    notes text
);


ALTER TABLE public.route_history OWNER TO postgres;

--
-- Name: route_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.route_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.route_history_id_seq OWNER TO postgres;

--
-- Name: route_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.route_history_id_seq OWNED BY public.route_history.id;


--
-- Name: vehicle_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_usage (
    id integer NOT NULL,
    vehicle_id integer NOT NULL,
    date timestamp with time zone DEFAULT now(),
    distance_traveled double precision,
    fuel_consumption double precision,
    maintenance_status character varying(50),
    utilization_rate double precision,
    notes text
);


ALTER TABLE public.vehicle_usage OWNER TO postgres;

--
-- Name: vehicle_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicle_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_usage_id_seq OWNER TO postgres;

--
-- Name: vehicle_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicle_usage_id_seq OWNED BY public.vehicle_usage.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    plate_number character varying(50) NOT NULL,
    type character varying(50) NOT NULL,
    capacity character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicles_id_seq OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: depots id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depots ALTER COLUMN id SET DEFAULT nextval('public.depots_id_seq'::regclass);


--
-- Name: driver_performance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_performance ALTER COLUMN id SET DEFAULT nextval('public.driver_performance_id_seq'::regclass);


--
-- Name: drivers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers ALTER COLUMN id SET DEFAULT nextval('public.drivers_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: route_analytics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_analytics ALTER COLUMN id SET DEFAULT nextval('public.route_analytics_id_seq'::regclass);


--
-- Name: route_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_history ALTER COLUMN id SET DEFAULT nextval('public.route_history_id_seq'::regclass);


--
-- Name: vehicle_usage id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_usage ALTER COLUMN id SET DEFAULT nextval('public.vehicle_usage_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Data for Name: depots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.depots (id, name, address, capacity, status, created_at, updated_at) FROM stdin;
8	Banglore	Bengaluru - Mumbai Hwy, Indira Nagar, Tilak Nagar, Chembur, Mumbai, Maharashtra, India	100	Active	2025-06-13 14:37:44.515255+05:30	\N
9	Chennai	koyambedu bus terminus, SAF Games Village, Annai Sathya Nagar, Koyambedu, Chennai, Tamil Nadu 600107, India	1000	Active	2025-06-13 14:38:06.9094+05:30	\N
10	Mumbai	Mumbai - Pune Expy, Yamuna Kunj, Sector-10, New Panvel East, Panvel, Navi Mumbai, Maharashtra, India	1000	Active	2025-06-13 14:38:29.687209+05:30	\N
\.


--
-- Data for Name: driver_performance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driver_performance (id, driver_id, date, routes_completed, avg_time_per_delivery, total_distance, total_duration, on_time_delivery_rate, notes) FROM stdin;
\.


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drivers (id, name, email, phone, license_number, experience, created_at, updated_at) FROM stdin;
6	Pranav	pranav@gmail.com	8220354533	A7DA8C922	3	2025-06-13 14:44:56.759782+05:30	\N
7	Vikram	vikram@gmail.com				2025-06-13 14:45:25.005354+05:30	\N
8	Abi	abi@gmail.com				2025-06-13 14:46:18.2869+05:30	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, address, order_number, customer_name, phone, email, notes, start_time, end_time, duration, load, created_at, updated_at) FROM stdin;
9	Madurai Omni Bus Stand Rd, Madurai, Tamil Nadu, India	ORD-1	Kevin	8220354533	kevin.samuel0407@gmail.com	\N	08:00	22:00	30	100	2025-06-13 14:39:29.408603+05:30	\N
10	Kochi - Salem Hwy, Edappally Toll, Unnichira, Koonamthai, Edappally, Ernakulam, Kerala, India	ORD-2	Josh	8220354511	\N	\N	08:00	22:00	20	100	2025-06-13 14:40:24.134875+05:30	\N
11	ASG Lourdasamy Pillai Central Bus Stand Rd, Cantonment, Tiruchirappalli, Tamil Nadu 620001, India	ORD-3	AJ	\N	\N	\N	08:00	22:00	\N	100	2025-06-13 14:41:07.911086+05:30	\N
12	VIT Rd, Solai Nagar, Katpadi, Vellore, Tamil Nadu, India	ORD-4	Vishal	\N	\N	\N	08:00	22:00	\N	100	2025-06-13 14:42:21.25239+05:30	\N
13	Hosur - Thally Rd, SBM Colony, Anthivadi, Hosur, Tamil Nadu, India	ORD-5	DK	\N	\N	\N	08:00	22:00	\N	100	2025-06-13 14:43:14.334715+05:30	\N
\.


--
-- Data for Name: route_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.route_analytics (id, date, route_history_id, planned_vs_actual_time_diff, planned_vs_actual_distance_diff, efficiency_score, weather_conditions, traffic_conditions, meta_data) FROM stdin;
\.


--
-- Data for Name: route_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.route_history (id, name, date_created, total_distance, total_duration, total_orders, driver_id, vehicle_id, depot_id, route_data, actual_completion_time, actual_distance, notes) FROM stdin;
\.


--
-- Data for Name: vehicle_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_usage (id, vehicle_id, date, distance_traveled, fuel_consumption, maintenance_status, utilization_rate, notes) FROM stdin;
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (id, plate_number, type, capacity, created_at, updated_at) FROM stdin;
9	TN01AB1234	truck	1	2025-06-13 14:43:42.508156+05:30	\N
10	TN03AB1555	truck	1	2025-06-13 14:43:58.794078+05:30	\N
11	TN45AK1221	van	1	2025-06-13 14:44:19.087249+05:30	\N
\.


--
-- Name: depots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.depots_id_seq', 10, true);


--
-- Name: driver_performance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.driver_performance_id_seq', 1, false);


--
-- Name: drivers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drivers_id_seq', 8, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 13, true);


--
-- Name: route_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.route_analytics_id_seq', 1, false);


--
-- Name: route_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.route_history_id_seq', 1, false);


--
-- Name: vehicle_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicle_usage_id_seq', 1, false);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 11, true);


--
-- Name: depots depots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depots
    ADD CONSTRAINT depots_pkey PRIMARY KEY (id);


--
-- Name: driver_performance driver_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_performance
    ADD CONSTRAINT driver_performance_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_email_key UNIQUE (email);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: route_analytics route_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_analytics
    ADD CONSTRAINT route_analytics_pkey PRIMARY KEY (id);


--
-- Name: route_history route_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_history
    ADD CONSTRAINT route_history_pkey PRIMARY KEY (id);


--
-- Name: vehicle_usage vehicle_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_usage
    ADD CONSTRAINT vehicle_usage_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_plate_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_plate_number_key UNIQUE (plate_number);


--
-- Name: ix_depots_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_depots_id ON public.depots USING btree (id);


--
-- Name: ix_driver_performance_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_driver_performance_id ON public.driver_performance USING btree (id);


--
-- Name: ix_drivers_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_drivers_id ON public.drivers USING btree (id);


--
-- Name: ix_orders_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_orders_id ON public.orders USING btree (id);


--
-- Name: ix_route_analytics_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_route_analytics_id ON public.route_analytics USING btree (id);


--
-- Name: ix_route_history_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_route_history_id ON public.route_history USING btree (id);


--
-- Name: ix_vehicle_usage_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_vehicle_usage_id ON public.vehicle_usage USING btree (id);


--
-- Name: ix_vehicles_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_vehicles_id ON public.vehicles USING btree (id);


--
-- Name: driver_performance driver_performance_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_performance
    ADD CONSTRAINT driver_performance_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id);


--
-- Name: route_analytics route_analytics_route_history_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_analytics
    ADD CONSTRAINT route_analytics_route_history_id_fkey FOREIGN KEY (route_history_id) REFERENCES public.route_history(id);


--
-- Name: route_history route_history_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_history
    ADD CONSTRAINT route_history_depot_id_fkey FOREIGN KEY (depot_id) REFERENCES public.depots(id);


--
-- Name: route_history route_history_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_history
    ADD CONSTRAINT route_history_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id);


--
-- Name: route_history route_history_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_history
    ADD CONSTRAINT route_history_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: vehicle_usage vehicle_usage_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_usage
    ADD CONSTRAINT vehicle_usage_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- PostgreSQL database dump complete
--

