--
-- PostgreSQL database dump
--

\restrict B3hmdVXHs756MCJhaTHefV6EieulluQUAeERsLAIZ80w5gIlf6E2NT30zUdfAbS

-- Dumped from database version 14.24
-- Dumped by pg_dump version 14.24

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_raster; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_raster WITH SCHEMA public;


--
-- Name: EXTENSION postgis_raster; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_raster IS 'PostGIS raster types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agricultural_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agricultural_fields (
    id integer NOT NULL,
    field_name character varying(150) NOT NULL,
    village_id integer NOT NULL,
    area_hectares numeric(10,2) NOT NULL,
    geometry public.geometry(Polygon,4326) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT agricultural_fields_area_hectares_check CHECK ((area_hectares > (0)::numeric)),
    CONSTRAINT chk_fields_geom_valid CHECK (public.st_isvalid(geometry))
);


--
-- Name: TABLE agricultural_fields; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.agricultural_fields IS 'Individual cadastral/agricultural field parcels with calculated hectares.';


--
-- Name: agricultural_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.agricultural_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: agricultural_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.agricultural_fields_id_seq OWNED BY public.agricultural_fields.id;


--
-- Name: districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.districts (
    id integer NOT NULL,
    district_name character varying(100) NOT NULL,
    state_name character varying(100) NOT NULL,
    geometry public.geometry(MultiPolygon,4326) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_districts_geom_valid CHECK (public.st_isvalid(geometry))
);


--
-- Name: TABLE districts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.districts IS 'Administrative district boundaries with WGS84 multi-polygon geometries.';


--
-- Name: districts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.districts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: districts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.districts_id_seq OWNED BY public.districts.id;


--
-- Name: land_use_classification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.land_use_classification (
    id integer NOT NULL,
    classification_type character varying(100) NOT NULL,
    confidence_score numeric(5,4),
    analysis_date date NOT NULL,
    geometry public.geometry(MultiPolygon,4326) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_landuse_geom_valid CHECK (public.st_isvalid(geometry)),
    CONSTRAINT land_use_classification_confidence_score_check CHECK (((confidence_score >= 0.0) AND (confidence_score <= 1.0)))
);


--
-- Name: TABLE land_use_classification; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.land_use_classification IS 'Land Use / Land Cover (LULC) spatial classification zones.';


--
-- Name: land_use_classification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.land_use_classification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: land_use_classification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.land_use_classification_id_seq OWNED BY public.land_use_classification.id;


--
-- Name: risk_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.risk_zones (
    id integer NOT NULL,
    risk_type character varying(100) NOT NULL,
    risk_level character varying(50) NOT NULL,
    confidence_score numeric(5,4),
    analysis_date date NOT NULL,
    geometry public.geometry(MultiPolygon,4326) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_risk_geom_valid CHECK (public.st_isvalid(geometry)),
    CONSTRAINT risk_zones_confidence_score_check CHECK (((confidence_score >= 0.0) AND (confidence_score <= 1.0)))
);


--
-- Name: TABLE risk_zones; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.risk_zones IS 'Delineated spatial risk zones derived from multi-criteria GIS & ML analysis.';


--
-- Name: risk_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.risk_zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: risk_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.risk_zones_id_seq OWNED BY public.risk_zones.id;


--
-- Name: satellite_observations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.satellite_observations (
    id integer NOT NULL,
    observation_date date NOT NULL,
    satellite_name character varying(100) NOT NULL,
    cloud_percentage numeric(5,2),
    acquisition_metadata jsonb DEFAULT '{}'::jsonb,
    footprint public.geometry(Polygon,4326) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_sat_footprint_valid CHECK (public.st_isvalid(footprint)),
    CONSTRAINT satellite_observations_cloud_percentage_check CHECK (((cloud_percentage >= 0.0) AND (cloud_percentage <= 100.0)))
);


--
-- Name: TABLE satellite_observations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.satellite_observations IS 'Catalog of satellite scene footprints and acquisition metadata.';


--
-- Name: satellite_observations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.satellite_observations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: satellite_observations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.satellite_observations_id_seq OWNED BY public.satellite_observations.id;


--
-- Name: soil_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.soil_data (
    id integer NOT NULL,
    location character varying(200),
    soil_type character varying(100) NOT NULL,
    ph numeric(4,2),
    nitrogen numeric(8,2),
    phosphorus numeric(8,2),
    potassium numeric(8,2),
    organic_carbon numeric(5,2),
    geometry public.geometry(Point,4326) NOT NULL,
    sampled_date date DEFAULT CURRENT_DATE,
    CONSTRAINT chk_soil_geom_valid CHECK (public.st_isvalid(geometry)),
    CONSTRAINT soil_data_nitrogen_check CHECK ((nitrogen >= (0)::numeric)),
    CONSTRAINT soil_data_organic_carbon_check CHECK ((organic_carbon >= (0)::numeric)),
    CONSTRAINT soil_data_ph_check CHECK (((ph >= 0.0) AND (ph <= 14.0))),
    CONSTRAINT soil_data_phosphorus_check CHECK ((phosphorus >= (0)::numeric)),
    CONSTRAINT soil_data_potassium_check CHECK ((potassium >= (0)::numeric))
);


--
-- Name: TABLE soil_data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.soil_data IS 'Soil testing laboratory measurements and nutrient profiles at spatial sample points.';


--
-- Name: soil_data_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.soil_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: soil_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.soil_data_id_seq OWNED BY public.soil_data.id;


--
-- Name: vegetation_indices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vegetation_indices (
    id integer NOT NULL,
    field_id integer NOT NULL,
    observation_id integer NOT NULL,
    ndvi numeric(5,4),
    ndwi numeric(5,4),
    analysis_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vegetation_indices_ndvi_check CHECK (((ndvi >= '-1.0'::numeric) AND (ndvi <= 1.0))),
    CONSTRAINT vegetation_indices_ndwi_check CHECK (((ndwi >= '-1.0'::numeric) AND (ndwi <= 1.0)))
);


--
-- Name: TABLE vegetation_indices; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.vegetation_indices IS 'Time-series remote sensing vegetation and water indices per agricultural field.';


--
-- Name: vegetation_indices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vegetation_indices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vegetation_indices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vegetation_indices_id_seq OWNED BY public.vegetation_indices.id;


--
-- Name: villages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.villages (
    id integer NOT NULL,
    village_name character varying(150) NOT NULL,
    district_id integer NOT NULL,
    geometry public.geometry(MultiPolygon,4326) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_villages_geom_valid CHECK (public.st_isvalid(geometry))
);


--
-- Name: TABLE villages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.villages IS 'Village administrative boundaries linked to parent district.';


--
-- Name: villages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.villages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: villages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.villages_id_seq OWNED BY public.villages.id;


--
-- Name: water_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.water_sources (
    id integer NOT NULL,
    source_name character varying(150) NOT NULL,
    source_type character varying(80) NOT NULL,
    geometry public.geometry(Geometry,4326) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_water_geom_valid CHECK (public.st_isvalid(geometry))
);


--
-- Name: TABLE water_sources; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.water_sources IS 'Natural and artificial surface water bodies, canals and rivers.';


--
-- Name: water_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.water_sources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: water_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.water_sources_id_seq OWNED BY public.water_sources.id;


--
-- Name: weather_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weather_data (
    id integer NOT NULL,
    observation_date date NOT NULL,
    temperature numeric(5,2),
    rainfall numeric(6,2),
    humidity numeric(5,2),
    geometry public.geometry(Point,4326) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_weather_geom_valid CHECK (public.st_isvalid(geometry)),
    CONSTRAINT weather_data_humidity_check CHECK (((humidity >= 0.0) AND (humidity <= 100.0))),
    CONSTRAINT weather_data_rainfall_check CHECK ((rainfall >= 0.0))
);


--
-- Name: TABLE weather_data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.weather_data IS 'Daily meteorological observations from agro-meteorological stations.';


--
-- Name: weather_data_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.weather_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: weather_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.weather_data_id_seq OWNED BY public.weather_data.id;


--
-- Name: agricultural_fields id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agricultural_fields ALTER COLUMN id SET DEFAULT nextval('public.agricultural_fields_id_seq'::regclass);


--
-- Name: districts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts ALTER COLUMN id SET DEFAULT nextval('public.districts_id_seq'::regclass);


--
-- Name: land_use_classification id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.land_use_classification ALTER COLUMN id SET DEFAULT nextval('public.land_use_classification_id_seq'::regclass);


--
-- Name: risk_zones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.risk_zones ALTER COLUMN id SET DEFAULT nextval('public.risk_zones_id_seq'::regclass);


--
-- Name: satellite_observations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satellite_observations ALTER COLUMN id SET DEFAULT nextval('public.satellite_observations_id_seq'::regclass);


--
-- Name: soil_data id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_data ALTER COLUMN id SET DEFAULT nextval('public.soil_data_id_seq'::regclass);


--
-- Name: vegetation_indices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vegetation_indices ALTER COLUMN id SET DEFAULT nextval('public.vegetation_indices_id_seq'::regclass);


--
-- Name: villages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.villages ALTER COLUMN id SET DEFAULT nextval('public.villages_id_seq'::regclass);


--
-- Name: water_sources id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.water_sources ALTER COLUMN id SET DEFAULT nextval('public.water_sources_id_seq'::regclass);


--
-- Name: weather_data id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weather_data ALTER COLUMN id SET DEFAULT nextval('public.weather_data_id_seq'::regclass);


--
-- Data for Name: agricultural_fields; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agricultural_fields (id, field_name, village_id, area_hectares, geometry, created_at) FROM stdin;
1	Hingna-Field-01	2	32.23	0103000020E61000000100000005000000EC51B81E85BB53400AD7A3703D0A3540A4703D0AD7BB53400AD7A3703D0A354096438B6CE7BB5340EC51B81E850B3540DD24068195BB5340B29DEFA7C60B3540EC51B81E85BB53400AD7A3703D0A3540	2026-11-14 07:17:43.152779+00
2	Hingna-Field-02	2	27.63	0103000020E6100000010000000500000096438B6CE7BB5340D122DBF97E0A35404E62105839BC5340986E1283C00A35403F355EBA49BC534079E92631080C35408716D9CEF7BB5340B29DEFA7C60B354096438B6CE7BB5340D122DBF97E0A3540	2026-11-14 07:17:43.152779+00
3	Hingna-Field-03	2	55.25	0103000020E6100000010000000500000014AE47E17ABC5340CDCCCCCCCC0C3540B0726891EDBC5340931804560E0D3540A245B6F3FDBC5340022B8716D90E3540068195438BBC53403BDF4F8D970E354014AE47E17ABC5340CDCCCCCCCC0C3540	2026-11-14 07:17:43.152779+00
4	Kalmeshwar-Orchard-01	3	81.64	0103000020E6100000010000000500000052B81E85EBB95340F6285C8FC2353540D122DBF97EBA5340BC74931804363540C3F5285C8FBA5340F2D24D6210383540448B6CE7FBB953402B8716D9CE37354052B81E85EBB95340F6285C8FC2353540	2026-11-14 07:17:43.152779+00
5	Kalmeshwar-Orchard-02	3	55.19	0103000020E61000000100000005000000986E1283C0BA534046B6F3FDD43835403333333333BB53400C022B87163935402506819543BB53407B14AE47E13A3540894160E5D0BA5340B4C876BE9F3A3540986E1283C0BA534046B6F3FDD4383540	2026-11-14 07:17:43.152779+00
6	Katol-Citrus-01	4	150.65	0103000020E6100000010000000500000085EB51B81EA55340C3F5285C8F423540D9CEF753E3A55340894160E5D0423540CBA145B6F3A553401283C0CAA145354077BE9F1A2FA553404C3789416045354085EB51B81EA55340C3F5285C8F423540	2026-11-14 07:17:43.152779+00
7	Katol-Cotton-02	4	81.66	0103000020E610000001000000050000001F85EB51B8A653403D0AD7A3703D35409EEFA7C64BA7534004560E2DB23D35408FC2F5285CA7534039B4C876BE3F3540105839B4C8A65340736891ED7C3F35401F85EB51B8A653403D0AD7A3703D3540	2026-11-14 07:17:43.152779+00
8	Narkhed-Orchard-01	5	112.56	0103000020E610000001000000050000001F85EB51B89E5340F6285C8FC27535408195438B6C9F5340BC74931804763540736891ED7C9F5340B81E85EB51783540105839B4C89E5340F2D24D62107835401F85EB51B89E5340F6285C8FC2753540	2026-11-14 07:17:43.152779+00
9	Saoner-Cotton-01	6	72.36	0103000020E610000001000000050000001F85EB51B8BE5340E17A14AE47613540AC1C5A643BBF5340A8C64B37896135409EEFA7C64BBF5340DD24068195633540105839B4C8BE534017D9CEF7536335401F85EB51B8BE5340E17A14AE47613540	2026-11-14 07:17:45.615644+00
10	Saoner-Cane-02	6	102.21	0103000020E6100000010000000500000048E17A14AEBF53403108AC1C5A643540B81E85EB51C05340F853E3A59B643540AAF1D24D62C05340F4FDD478E966354039B4C876BEBF53402DB29DEFA766354048E17A14AEBF53403108AC1C5A643540	2026-11-14 07:17:45.615644+00
11	Parseoni-Paddy-01	7	91.84	0103000020E61000000100000005000000AE47E17A14CE5340295C8FC2F56835402DB29DEFA7CE5340F0A7C64B376935401F85EB51B8CE5340EC51B81E856B3540A01A2FDD24CE534025068195436B3540AE47E17A14CE5340295C8FC2F5683540	2026-11-14 07:17:45.615644+00
12	Ramtek-Paddy-01	8	136.56	0103000020E61000000100000005000000B81E85EB51D8534033333333337335400C022B8716D95340FA7E6ABC74733540FED478E926D95340BC74931804763540AAF1D24D62D85340F6285C8FC2753540B81E85EB51D853403333333333733540	2026-11-14 07:17:45.615644+00
13	Mouda-Paddy-01	9	191.94	0103000020E610000001000000050000006666666666D65340B81E85EB513835409EEFA7C64BD753407F6ABC74933835408FC2F5285CD75340CFF753E3A53B35405839B4C876D6534008AC1C5A643B35406666666666D65340B81E85EB51383540	2026-11-14 07:17:45.615644+00
14	Mouda-Wheat-02	9	102.30	0103000020E610000001000000050000000000000000D8534014AE47E17A343540713D0AD7A3D85340DBF97E6ABC34354062105839B4D85340D7A3703D0A373540F2D24D6210D85340105839B4C83635400000000000D8534014AE47E17A343540	2026-11-14 07:17:45.615644+00
15	Kamptee-Vegetable-01	10	55.17	0103000020E61000000100000005000000CDCCCCCCCCCC53407B14AE47E13A35406891ED7C3FCD53404260E5D0223B35405A643BDF4FCD5340B0726891ED3C3540BE9F1A2FDDCC5340E9263108AC3C3540CDCCCCCCCCCC53407B14AE47E13A3540	2026-11-14 07:17:45.615644+00
16	Umred-Soybean-01	11	137.13	0103000020E6100000010000000500000052B81E85EBD1534014AE47E17AD43440A69BC420B0D25340DBF97E6ABCD43440986E1283C0D253409EEFA7C64BD73440448B6CE7FBD15340D7A3703D0AD7344052B81E85EBD1534014AE47E17AD43440	2026-11-14 07:17:45.615644+00
17	Umred-Gram-02	11	81.80	0103000020E61000000100000005000000A4703D0AD7D353409A99999999D9344023DBF97E6AD4534060E5D022DBD9344014AE47E17AD4534096438B6CE7DB344096438B6CE7D35340CFF753E3A5DB3440A4703D0AD7D353409A99999999D93440	2026-11-14 07:17:45.615644+00
18	Kuhi-Paddy-01	12	178.42	0103000020E610000001000000050000000AD7A3703DDA53407B14AE47E1FA3440508D976E12DB53404260E5D022FB34404260E5D022DB534091ED7C3F35FE3440FCA9F1D24DDA5340CBA145B6F3FD34400AD7A3703DDA53407B14AE47E1FA3440	2026-11-14 07:17:45.615644+00
19	Bhiwapur-Chilli-01	13	72.62	0103000020E61000000100000005000000713D0AD7A3E05340C3F5285C8FC23440FED478E926E15340894160E5D0C23440F0A7C64B37E15340BE9F1A2FDDC4344062105839B4E05340F853E3A59BC43440713D0AD7A3E05340C3F5285C8FC23440	2026-11-14 07:17:45.615644+00
20	NagpurRural-Hort-01	1	72.46	0103000020E610000001000000050000003333333333C353406666666666263540C1CAA145B6C353402DB29DEFA7263540B29DEFA7C6C3534062105839B42835402506819543C353409CC420B0722835403333333333C353406666666666263540	2026-11-14 07:17:45.615644+00
\.


--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.districts (id, district_name, state_name, geometry, created_at) FROM stdin;
1	Nagpur	Maharashtra	0106000020E6100000010000000103000000010000000E00000052B81E85EB9153409A99999999593540CDCCCCCCCC9C53406666666666A635400000000000B053403D0AD7A370BD35409A99999999C95340B81E85EB51B835401F85EB51B8DE53401F85EB51B89E3540AE47E17A14EE53403333333333733540B81E85EB51F8534033333333333335400000000000F053409A99999999D93440E17A14AE47E1534014AE47E17A943440AE47E17A14CE5340CDCCCCCCCC8C34406666666666B653406666666666A63440E17A14AE47A153406666666666E6344014AE47E17A945340666666666626354052B81E85EB9153409A99999999593540	2026-11-14 07:17:43.152779+00
2	Wardha	Maharashtra	0106000020E6100000010000000103000000010000000600000033333333338353409A99999999D93440E17A14AE47A153406666666666E634406666666666B653406666666666A634409A99999999A953409A999999995934400000000000905340CDCCCCCCCC4C344033333333338353409A99999999D93440	2026-11-14 07:17:45.550955+00
3	Bhandara	Maharashtra	0106000020E61000000100000001030000000100000005000000AE47E17A14EE53403333333333733540333333333303544000000000008035409A999999990954406666666666263540B81E85EB51F853403333333333333540AE47E17A14EE53403333333333733540	2026-11-14 07:17:45.550955+00
\.


--
-- Data for Name: land_use_classification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.land_use_classification (id, classification_type, confidence_score, analysis_date, geometry, created_at) FROM stdin;
1	Cropland (Intensive Irrigated / Orchards)	0.9150	2026-10-22	0106000020E61000000100000001030000000100000005000000B81E85EB51B85340AE47E17A142E3540AE47E17A14BE5340AE47E17A142E35401F85EB51B8BE534048E17A14AE47354048E17A14AEB7534048E17A14AE473540B81E85EB51B85340AE47E17A142E3540	2026-11-14 07:17:43.152779+00
2	Cropland (Rainfed Kharif)	0.8800	2026-10-22	0106000020E61000000100000001030000000100000005000000295C8FC2F5B85340C3F5285C8F0235408FC2F5285CBF5340C3F5285C8F0235400000000000C053409A99999999193540295C8FC2F5B853409A99999999193540295C8FC2F5B85340C3F5285C8F023540	2026-11-14 07:17:43.152779+00
3	Water Body (Surface Reservoirs)	0.9850	2026-10-22	0106000020E61000000100000001030000000100000005000000F6285C8FC2B5534052B81E85EB1135409A99999999B9534052B81E85EB1135409A99999999B95340E17A14AE47213540F6285C8FC2B55340E17A14AE47213540F6285C8FC2B5534052B81E85EB113540	2026-11-14 07:17:43.152779+00
\.


--
-- Data for Name: risk_zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.risk_zones (id, risk_type, risk_level, confidence_score, analysis_date, geometry, created_at) FROM stdin;
1	Agricultural Drought Vulnerability	Moderate	0.8250	2026-10-22	0106000020E610000001000000010300000001000000050000007B14AE47E1BA534048E17A14AE07354014AE47E17ABC5340D578E9263108354023DBF97E6ABC5340068195438B0C35406DE7FBA9F1BA534079E92631080C35407B14AE47E1BA534048E17A14AE073540	2026-11-14 07:17:43.152779+00
2	Soil Moisture Stress	Low	0.7400	2026-10-22	0106000020E61000000100000001030000000100000005000000E17A14AE47D1534052B81E85EBD134403333333333D35340DF4F8D976ED2344017D9CEF753D353409A99999999D93440C520B07268D153400C022B8716D93440E17A14AE47D1534052B81E85EBD13440	2026-11-14 07:17:43.152779+00
\.


--
-- Data for Name: satellite_observations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.satellite_observations (id, observation_date, satellite_name, cloud_percentage, acquisition_metadata, footprint, created_at) FROM stdin;
1	2026-09-25	Sentinel-2A	3.80	{"crs": "EPSG:32644", "tile": "44QKG", "orbit": 119, "sensor": "MSI", "sun_elevation": 58.4, "processing_level": "Level-2A"}	0103000020E610000001000000050000006666666666A65340CDCCCCCCCCCC3440CDCCCCCCCCEC5340CDCCCCCCCCCC3440CDCCCCCCCCEC5340CDCCCCCCCCCC35406666666666A65340CDCCCCCCCCCC35406666666666A65340CDCCCCCCCCCC3440	2026-11-14 07:17:43.152779+00
2	2026-10-20	Sentinel-2B	1.20	{"crs": "EPSG:32644", "tile": "44QKG", "orbit": 119, "sensor": "MSI", "sun_elevation": 52.1, "processing_level": "Level-2A"}	0103000020E610000001000000050000006666666666A65340CDCCCCCCCCCC3440CDCCCCCCCCEC5340CDCCCCCCCCCC3440CDCCCCCCCCEC5340CDCCCCCCCCCC35406666666666A65340CDCCCCCCCCCC35406666666666A65340CDCCCCCCCCCC3440	2026-11-14 07:17:43.152779+00
\.


--
-- Data for Name: soil_data; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.soil_data (id, location, soil_type, ph, nitrogen, phosphorus, potassium, organic_carbon, geometry, sampled_date) FROM stdin;
1	Hingna South Agro-Lab Sample S1	Deep Black Cotton Soil (Vertisol)	7.85	192.50	18.40	345.00	0.58	0101000020E6100000CFF753E3A5BB5340986E1283C00A3540	2026-09-15
2	Kalmeshwar Citrus Belt Sample S2	Medium Black Soil with Calcareous Substrata	8.10	175.20	22.80	410.00	0.64	0101000020E61000000AD7A3703DBA5340D7A3703D0A373540	2026-09-18
3	Saoner Alluvial Floodplain S3	Clay Loam Alluvial Soil	7.35	235.00	31.50	380.00	0.82	0101000020E6100000E5D022DBF9BE5340C3F5285C8F623540	2026-09-20
4	Umred Plains Rainfed Sample S4	Shallow to Medium Black Soil	7.60	168.00	14.20	290.00	0.49	0101000020E61000000AD7A3703DD25340F6285C8FC2D53440	2026-09-22
5	Katol Mandi Benchmark Site	Medium Black Calcareous Soil	8.20	180.00	19.50	360.00	0.52	0101000020E61000003D0AD7A370A55340A4703D0AD7433540	2026-09-20
6	Ramtek Foot-hills Testing Lab	Red Gravelly Loam (Typic Rhodustalfs)	6.70	210.00	26.00	240.00	0.78	0101000020E6100000713D0AD7A3D8534014AE47E17A743540	2026-09-20
7	Mouda Paddy Research Plot	Deep Clayey Vertisol	7.45	245.00	34.00	395.00	0.85	0101000020E61000001F85EB51B8D653409A99999999393540	2026-09-20
8	Bhiwapur Agro Station	Mixed Red and Black Soil	7.15	188.00	21.00	310.00	0.61	0101000020E6100000295C8FC2F5E05340A4703D0AD7C33440	2026-09-20
\.


--
-- Data for Name: vegetation_indices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vegetation_indices (id, field_id, observation_id, ndvi, ndwi, analysis_date) FROM stdin;
1	1	1	0.6842	0.2140	2026-09-26 10:30:00+00
2	2	1	0.5410	0.0820	2026-09-26 10:30:00+00
3	3	1	0.7250	0.2680	2026-09-26 10:30:00+00
4	4	1	0.7620	0.3150	2026-09-26 10:30:00+00
5	5	1	0.7410	0.2890	2026-09-26 10:30:00+00
6	6	1	0.6930	0.2210	2026-09-26 10:30:00+00
7	7	1	0.8120	0.3840	2026-09-26 10:30:00+00
8	8	1	0.6150	0.1540	2026-09-26 10:30:00+00
9	1	2	0.5920	0.1210	2026-10-21 11:00:00+00
10	2	2	0.4180	-0.0150	2026-10-21 11:00:00+00
11	3	2	0.6810	0.1980	2026-10-21 11:00:00+00
12	4	2	0.7490	0.2980	2026-10-21 11:00:00+00
13	5	2	0.7280	0.2710	2026-10-21 11:00:00+00
14	6	2	0.6350	0.1620	2026-10-21 11:00:00+00
15	7	2	0.7950	0.3510	2026-10-21 11:00:00+00
16	8	2	0.5230	0.0810	2026-10-21 11:00:00+00
\.


--
-- Data for Name: villages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.villages (id, village_name, district_id, geometry, created_at) FROM stdin;
1	Nagpur Rural	1	0106000020E610000001000000010300000001000000050000003D0AD7A370BD534014AE47E17A1435400AD7A3703DCA534014AE47E17A143540EC51B81E85CB5340B81E85EB513835401F85EB51B8BE5340B81E85EB513835403D0AD7A370BD534014AE47E17A143540	2026-11-14 07:17:43.152779+00
2	Hingna	1	0106000020E6100000010000000103000000010000000500000014AE47E17AB453403333333333F33440E17A14AE47C153403333333333F33440E17A14AE47C153409A9999999919354014AE47E17AB453409A9999999919354014AE47E17AB453403333333333F33440	2026-11-14 07:17:43.152779+00
3	Kalmeshwar	1	0106000020E610000001000000010300000001000000050000003333333333B35340AE47E17A142E35400000000000C05340AE47E17A142E35400000000000C0534052B81E85EB5135403333333333B3534052B81E85EB5135403333333333B35340AE47E17A142E3540	2026-11-14 07:17:43.152779+00
4	Katol	1	0106000020E61000000100000001030000000100000005000000CDCCCCCCCC9C534066666666662635400000000000B0534066666666662635400000000000B053409A99999999593540CDCCCCCCCC9C53409A99999999593540CDCCCCCCCC9C53406666666666263540	2026-11-14 07:17:43.152779+00
5	Narkhed	1	0106000020E6100000010000000103000000010000000500000066666666669653409A999999995935409A99999999A953409A999999995935409A99999999A9534014AE47E17A943540666666666696534014AE47E17A94354066666666669653409A99999999593540	2026-11-14 07:17:45.570933+00
6	Saoner	1	0106000020E610000001000000010300000001000000050000006666666666B6534052B81E85EB51354048E17A14AEC7534052B81E85EB51354048E17A14AEC7534085EB51B81E8535406666666666B6534085EB51B81E8535406666666666B6534052B81E85EB513540	2026-11-14 07:17:45.570933+00
7	Parseoni	1	0106000020E610000001000000010300000001000000050000006666666666C6534052B81E85EB5135406666666666D6534052B81E85EB5135406666666666D65340CDCCCCCCCC8C35406666666666C65340CDCCCCCCCC8C35406666666666C6534052B81E85EB513540	2026-11-14 07:17:45.570933+00
8	Ramtek	1	0106000020E610000001000000010300000001000000050000000000000000D0534052B81E85EB5135403333333333E3534052B81E85EB5135403333333333E353406666666666A635400000000000D053406666666666A635400000000000D0534052B81E85EB513540	2026-11-14 07:17:45.570933+00
9	Mouda	1	0106000020E61000000100000001030000000100000005000000AE47E17A14CE53401F85EB51B81E35400000000000E053401F85EB51B81E35400000000000E0534052B81E85EB513540AE47E17A14CE534052B81E85EB513540AE47E17A14CE53401F85EB51B81E3540	2026-11-14 07:17:45.570933+00
10	Kamptee	1	0106000020E6100000010000000103000000010000000500000048E17A14AEC75340AE47E17A142E35403333333333D35340AE47E17A142E35403333333333D35340CDCCCCCCCC4C354048E17A14AEC75340CDCCCCCCCC4C354048E17A14AEC75340AE47E17A142E3540	2026-11-14 07:17:45.570933+00
11	Umred	1	0106000020E61000000100000001030000000100000005000000EC51B81E85CB53400000000000C034401F85EB51B8DE53400000000000C034401F85EB51B8DE53400000000000003540EC51B81E85CB53400000000000003540EC51B81E85CB53400000000000C03440	2026-11-14 07:17:45.570933+00
12	Kuhi	1	0106000020E6100000010000000103000000010000000500000052B81E85EBD153406666666666E6344085EB51B81EE553406666666666E6344085EB51B81EE55340666666666626354052B81E85EBD15340666666666626354052B81E85EBD153406666666666E63440	2026-11-14 07:17:45.570933+00
13	Bhiwapur	1	0106000020E61000000100000001030000000100000005000000B81E85EB51D853406666666666A63440EC51B81E85EB53406666666666A63440EC51B81E85EB5340EC51B81E85EB3440B81E85EB51D85340EC51B81E85EB3440B81E85EB51D853406666666666A63440	2026-11-14 07:17:45.570933+00
14	Nagpur Urban	1	0106000020E61000000100000001030000000100000005000000E17A14AE47C153409A999999991935409A99999999C953409A999999991935409A99999999C953403333333333333540E17A14AE47C153403333333333333540E17A14AE47C153409A99999999193540	2026-11-14 07:17:45.570933+00
\.


--
-- Data for Name: water_sources; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.water_sources (id, source_name, source_type, geometry, created_at) FROM stdin;
1	Ambazari Lake	Lake	0103000020E6100000010000000600000052B81E85EBC153401F85EB51B81E35407B14AE47E1C25340AC1C5A643B1F35403333333333C35340C3F5285C8F223540C3F5285C8FC25340A4703D0AD72335409A99999999C153406F1283C0CA21354052B81E85EBC153401F85EB51B81E3540	2026-11-14 07:17:43.152779+00
2	Kanhan River	River	0102000020E610000006000000CDCCCCCCCCBC53403333333333733540E17A14AE47C15340E17A14AE476135409A99999999C9534048E17A14AE4735400000000000D05340B81E85EB513835409A99999999D9534066666666662635403333333333E35340CDCCCCCCCC0C3540	2026-11-14 07:17:43.152779+00
3	Pench Left Irrigation Canal	Canal	0102000020E610000005000000EC51B81E85CB5340EC51B81E856B354048E17A14AEC7534052B81E85EB513540A4703D0AD7C3534000000000004035401F85EB51B8BE5340AE47E17A142E35405C8FC2F528BC53408FC2F5285C0F3540	2026-11-14 07:17:43.152779+00
4	Vena Dam Reservoir	Reservoir	0103000020E610000001000000060000006666666666B6534014AE47E17A143540295C8FC2F5B85340F6285C8FC2153540E17A14AE47B953401F85EB51B81E3540D7A3703D0AB753400000000000203540AE47E17A14B653409A999999991935406666666666B6534014AE47E17A143540	2026-11-14 07:17:43.152779+00
5	Totladoh Reservoir (Pench Dam)	Reservoir	0103000020E6100000010000000600000052B81E85EBD153409A999999999935406666666666D653407B14AE47E19A3540D7A3703D0AD75340295C8FC2F5A83540A4703D0AD7D35340AE47E17A14AE3540E17A14AE47D15340E17A14AE47A1354052B81E85EBD153409A99999999993540	2026-11-14 07:17:45.642953+00
6	Khindsi Lake (Ramtek)	Lake	0103000020E61000000100000006000000F6285C8FC2D55340295C8FC2F568354048E17A14AED753400AD7A3703D6A35400000000000D853408FC2F5285C6F3540AE47E17A14D65340E3A59BC4207035403D0AD7A370D5534079E92631086C3540F6285C8FC2D55340295C8FC2F5683540	2026-11-14 07:17:45.642953+00
7	Gorewada Lake	Lake	0103000020E61000000100000006000000C3F5285C8FC25340713D0AD7A3303540A4703D0AD7C3534052B81E85EB3135405C8FC2F528C45340D7A3703D0A3735407B14AE47E1C25340B81E85EB513835400AD7A3703DC2534014AE47E17A343540C3F5285C8FC25340713D0AD7A3303540	2026-11-14 07:17:45.642953+00
8	Kolar River Reach	River	0102000020E6100000040000000000000000B05340E17A14AE47613540B81E85EB51B8534052B81E85EB5135400000000000C05340000000000040354048E17A14AEC75340F6285C8FC2353540	2026-11-14 07:17:45.642953+00
\.


--
-- Data for Name: weather_data; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.weather_data (id, observation_date, temperature, rainfall, humidity, geometry, created_at) FROM stdin;
1	2026-10-20	31.40	0.00	58.00	0101000020E610000017D9CEF753C35340F2D24D6210183540	2026-11-14 07:17:43.152779+00
2	2026-10-20	32.10	0.00	54.00	0101000020E61000005C8FC2F528BC5340AE47E17A140E3540	2026-11-14 07:17:43.152779+00
3	2026-10-20	31.80	0.00	56.00	0101000020E61000000AD7A3703DBA53407B14AE47E13A3540	2026-11-14 07:17:43.152779+00
4	2026-10-20	32.40	0.00	51.00	0101000020E6100000F6285C8FC2A55340C3F5285C8F423540	2026-11-14 07:17:43.152779+00
5	2026-10-20	30.80	0.00	61.00	0101000020E61000008FC2F5285CBF5340A4703D0AD7633540	2026-11-14 07:17:45.687896+00
6	2026-10-20	30.20	0.00	64.00	0101000020E6100000295C8FC2F5D853403333333333733540	2026-11-14 07:17:45.687896+00
7	2026-10-20	31.50	0.00	59.00	0101000020E6100000D7A3703D0AD75340B81E85EB51383540	2026-11-14 07:17:45.687896+00
8	2026-10-20	32.60	0.00	52.00	0101000020E610000052B81E85EBD1534014AE47E17AD43440	2026-11-14 07:17:45.687896+00
\.


--
-- Name: agricultural_fields_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.agricultural_fields_id_seq', 20, true);


--
-- Name: districts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.districts_id_seq', 3, true);


--
-- Name: land_use_classification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.land_use_classification_id_seq', 3, true);


--
-- Name: risk_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.risk_zones_id_seq', 2, true);


--
-- Name: satellite_observations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.satellite_observations_id_seq', 2, true);


--
-- Name: soil_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.soil_data_id_seq', 8, true);


--
-- Name: vegetation_indices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vegetation_indices_id_seq', 16, true);


--
-- Name: villages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.villages_id_seq', 14, true);


--
-- Name: water_sources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.water_sources_id_seq', 8, true);


--
-- Name: weather_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.weather_data_id_seq', 8, true);


--
-- Name: agricultural_fields agricultural_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agricultural_fields
    ADD CONSTRAINT agricultural_fields_pkey PRIMARY KEY (id);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: land_use_classification land_use_classification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.land_use_classification
    ADD CONSTRAINT land_use_classification_pkey PRIMARY KEY (id);


--
-- Name: risk_zones risk_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.risk_zones
    ADD CONSTRAINT risk_zones_pkey PRIMARY KEY (id);


--
-- Name: satellite_observations satellite_observations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satellite_observations
    ADD CONSTRAINT satellite_observations_pkey PRIMARY KEY (id);


--
-- Name: soil_data soil_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_data
    ADD CONSTRAINT soil_data_pkey PRIMARY KEY (id);


--
-- Name: districts uq_district_state; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT uq_district_state UNIQUE (district_name, state_name);


--
-- Name: vegetation_indices uq_field_observation; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vegetation_indices
    ADD CONSTRAINT uq_field_observation UNIQUE (field_id, observation_id);


--
-- Name: vegetation_indices vegetation_indices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vegetation_indices
    ADD CONSTRAINT vegetation_indices_pkey PRIMARY KEY (id);


--
-- Name: villages villages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.villages
    ADD CONSTRAINT villages_pkey PRIMARY KEY (id);


--
-- Name: water_sources water_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.water_sources
    ADD CONSTRAINT water_sources_pkey PRIMARY KEY (id);


--
-- Name: weather_data weather_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weather_data
    ADD CONSTRAINT weather_data_pkey PRIMARY KEY (id);


--
-- Name: idx_districts_geom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_districts_geom ON public.districts USING gist (geometry);


--
-- Name: idx_districts_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_districts_name ON public.districts USING btree (district_name);


--
-- Name: idx_fields_geom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fields_geom ON public.agricultural_fields USING gist (geometry);


--
-- Name: idx_fields_village_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fields_village_id ON public.agricultural_fields USING btree (village_id);


--
-- Name: idx_land_use_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_land_use_date ON public.land_use_classification USING btree (analysis_date DESC);


--
-- Name: idx_land_use_geom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_land_use_geom ON public.land_use_classification USING gist (geometry);


--
-- Name: idx_land_use_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_land_use_type ON public.land_use_classification USING btree (classification_type);


--
-- Name: idx_risk_type_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_risk_type_level ON public.risk_zones USING btree (risk_type, risk_level);


--
-- Name: idx_risk_zones_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_risk_zones_date ON public.risk_zones USING btree (analysis_date DESC);


--
-- Name: idx_risk_zones_geom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_risk_zones_geom ON public.risk_zones USING gist (geometry);


--
-- Name: idx_satellite_obs_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_satellite_obs_date ON public.satellite_observations USING btree (observation_date DESC);


--
-- Name: idx_satellite_obs_footprint; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_satellite_obs_footprint ON public.satellite_observations USING gist (footprint);


--
-- Name: idx_soil_geom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_soil_geom ON public.soil_data USING gist (geometry);


--
-- Name: idx_soil_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_soil_type ON public.soil_data USING btree (soil_type);


--
-- Name: idx_veg_indices_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_veg_indices_date ON public.vegetation_indices USING btree (analysis_date DESC);


--
-- Name: idx_veg_indices_field_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_veg_indices_field_id ON public.vegetation_indices USING btree (field_id);


--
-- Name: idx_veg_indices_obs_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_veg_indices_obs_id ON public.vegetation_indices USING btree (observation_id);


--
-- Name: idx_villages_district_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_villages_district_id ON public.villages USING btree (district_id);


--
-- Name: idx_villages_geom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_villages_geom ON public.villages USING gist (geometry);


--
-- Name: idx_villages_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_villages_name ON public.villages USING btree (village_name);


--
-- Name: idx_water_sources_geom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_water_sources_geom ON public.water_sources USING gist (geometry);


--
-- Name: idx_water_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_water_type ON public.water_sources USING btree (source_type);


--
-- Name: idx_weather_geom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weather_geom ON public.weather_data USING gist (geometry);


--
-- Name: idx_weather_obs_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weather_obs_date ON public.weather_data USING btree (observation_date DESC);


--
-- Name: agricultural_fields agricultural_fields_village_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agricultural_fields
    ADD CONSTRAINT agricultural_fields_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE CASCADE;


--
-- Name: vegetation_indices vegetation_indices_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vegetation_indices
    ADD CONSTRAINT vegetation_indices_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.agricultural_fields(id) ON DELETE CASCADE;


--
-- Name: vegetation_indices vegetation_indices_observation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vegetation_indices
    ADD CONSTRAINT vegetation_indices_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES public.satellite_observations(id) ON DELETE CASCADE;


--
-- Name: villages villages_district_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.villages
    ADD CONSTRAINT villages_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict B3hmdVXHs756MCJhaTHefV6EieulluQUAeERsLAIZ80w5gIlf6E2NT30zUdfAbS

