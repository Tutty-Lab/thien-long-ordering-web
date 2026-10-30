BEGIN;
CREATE TABLE IF NOT EXISTS menu_categories(name text PRIMARY KEY CHECK(length(name) BETWEEN 1 AND 80));
INSERT INTO menu_categories(name) SELECT DISTINCT category FROM menu_items ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS restaurant_settings(id integer PRIMARY KEY CHECK(id=1),name text NOT NULL,address text NOT NULL,phone text NOT NULL DEFAULT '',preparation_minutes integer NOT NULL CHECK(preparation_minutes BETWEEN 5 AND 180));
INSERT INTO restaurant_settings(id,name,address,preparation_minutes) VALUES(1,'Thiên Long','Olgastraße 5, 89518 Heidenheim',20) ON CONFLICT DO NOTHING;
COMMIT;
