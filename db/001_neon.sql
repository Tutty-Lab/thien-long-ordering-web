BEGIN;
CREATE TABLE IF NOT EXISTS menu_items(id text PRIMARY KEY,name text NOT NULL,category text NOT NULL,description text NOT NULL DEFAULT '',image text NOT NULL DEFAULT '',price_cents integer NOT NULL CHECK(price_cents>0),sale_cents integer CHECK(sale_cents>0 AND sale_cents<=price_cents),available boolean NOT NULL DEFAULT true);
CREATE TABLE IF NOT EXISTS orders(id uuid PRIMARY KEY,idempotency_key uuid UNIQUE NOT NULL,request_hash text NOT NULL,customer_name text NOT NULL,phone text NOT NULL,address text NOT NULL,note text NOT NULL DEFAULT '',items jsonb NOT NULL,total_cents integer NOT NULL CHECK(total_cents>0),status text NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW','PREPARING','READY','DONE','CANCELLED')),created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders(created_at DESC);
CREATE TABLE IF NOT EXISTS rate_limits(key text PRIMARY KEY,hits integer NOT NULL,expires_at timestamptz NOT NULL);
COMMIT;
