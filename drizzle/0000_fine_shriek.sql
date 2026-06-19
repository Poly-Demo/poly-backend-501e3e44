CREATE TABLE "products" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" real NOT NULL,
	"original_price" real,
	"rating" real NOT NULL,
	"image" text NOT NULL,
	"category" text NOT NULL
);
