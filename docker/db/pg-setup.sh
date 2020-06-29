#!/bin/bash
set -e

# Create sequences
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE SEQUENCE public."excuses_ID_seq"
        INCREMENT 1
        START 1
        MINVALUE 1
        MAXVALUE 2147483647
        CACHE 1;

    ALTER SEQUENCE public."excuses_ID_seq"
        OWNER TO postgres;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE SEQUENCE public."users_ID_seq"
        INCREMENT 1
        START 1
        MINVALUE 1
        MAXVALUE 2147483647
        CACHE 1;

    ALTER SEQUENCE public."users_ID_seq"
        OWNER TO postgres;
EOSQL

# Create functions
# TODO: Remove hardcoded username
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE FUNCTION public.update_ts()
        RETURNS trigger
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE NOT LEAKPROOF
    AS \$BODY\$
        BEGIN
            NEW.last_edited := current_timestamp;
            RETURN NEW;
        END;
    \$BODY\$;

    ALTER FUNCTION public.update_ts()
        OWNER TO postgres;
EOSQL

# Create tables
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE TABLE public.excuses
    (
        "ID" integer NOT NULL DEFAULT nextval('"excuses_ID_seq"'::regclass),
        excuse text COLLATE pg_catalog."default",
        lang character varying(2) COLLATE pg_catalog."default" NOT NULL,
        added_by text COLLATE pg_catalog."default",
        verified boolean,
        last_edited timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT excuses_pkey PRIMARY KEY ("ID")
    )
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;

    ALTER TABLE public.excuses
        OWNER to postgres;

    CREATE TRIGGER update_ts
        BEFORE INSERT OR UPDATE 
        ON public.excuses
        FOR EACH ROW
        EXECUTE PROCEDURE public.update_ts();
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE TABLE public.users
    (
        "ID" text COLLATE pg_catalog."default" NOT NULL DEFAULT nextval('"users_ID_seq"'::regclass),
        email text COLLATE pg_catalog."default" NOT NULL,
        picture text COLLATE pg_catalog."default" NOT NULL,
        hash character varying(40) COLLATE pg_catalog."default",
        token text COLLATE pg_catalog."default",
        refresh_token text COLLATE pg_catalog."default",
        username text COLLATE pg_catalog."default",
        admin boolean NOT NULL DEFAULT false,
        CONSTRAINT users_pkey PRIMARY KEY ("ID"),
        CONSTRAINT unique_hash UNIQUE (hash)
    )
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;

    ALTER TABLE public.users
        OWNER to postgres;
EOSQL