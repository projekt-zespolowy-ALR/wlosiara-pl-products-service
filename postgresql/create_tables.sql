CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE data_sources (
	id UUID DEFAULT uuid_generate_v4() NOT NULL,
	name TEXT NOT NULL,
	slug TEXT NOT NULL UNIQUE,
	url TEXT NOT NULL,
	PRIMARY KEY (id)
);


CREATE TABLE brands (
	id UUID DEFAULT uuid_generate_v4() NOT NULL,
	name TEXT NOT NULL,
	slug TEXT NOT NULL UNIQUE,
	PRIMARY KEY (id)
);



CREATE TABLE products (
	id UUID DEFAULT uuid_generate_v4() NOT NULL,
	name TEXT,
	slug TEXT NOT NULL UNIQUE,
	brand_id UUID,
	mass_kilograms DOUBLE PRECISION, -- in kilograms
	volume_liters DOUBLE PRECISION, -- in liters
	PRIMARY KEY (id),
	FOREIGN KEY (brand_id) REFERENCES brands (id)
);


CREATE TABLE ingredients_lists (
	id UUID DEFAULT uuid_generate_v4() NOT NULL,
	product_id UUID NOT NULL UNIQUE,
	-- if there is no ingredients list attached to a product
	-- then we consider the list to be unknown
	PRIMARY KEY (id),
	FOREIGN KEY (product_id) REFERENCES products (id)
);



CREATE TABLE ingredients (
	id UUID DEFAULT uuid_generate_v4() NOT NULL,
	slug TEXT NOT NULL UNIQUE,
	latin_name TEXT NOT NULL,
	PRIMARY KEY (id)
);




CREATE TABLE ingredients_in_ingredients_lists (
	ingredients_list_id UUID NOT NULL,
	ingredient_id UUID NOT NULL,
	order_in_list INTEGER NOT NULL,
	PRIMARY KEY (ingredients_list_id, ingredient_id),
	FOREIGN KEY (ingredients_list_id) REFERENCES ingredients_lists (id),
	FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
);

CREATE TABLE offers (
	product_id UUID NOT NULL,
	data_source_id UUID NOT NULL,
	reference_url TEXT,
	image_url TEXT,
	description TEXT,
	price_pln NUMERIC(10, 2),
	PRIMARY KEY (product_id, data_source_id),
	FOREIGN KEY (product_id) REFERENCES products (id),
	FOREIGN KEY (data_source_id) REFERENCES data_sources (id)
);

CREATE TABLE categories (
	id UUID DEFAULT uuid_generate_v4() NOT NULL,
	slug TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE products_in_categories (
	product_id UUID NOT NULL,
	category_id UUID NOT NULL,
	PRIMARY KEY (product_id, category_id),
	FOREIGN KEY (product_id) REFERENCES products (id),
	FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE user_favorite_products (
	user_id UUID NOT NULL,
	product_id UUID NOT NULL,
	FOREIGN KEY (product_id) REFERENCES products (id),
	PRIMARY KEY (user_id, product_id)
);
