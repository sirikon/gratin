CREATE TABLE "public"."doggo" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL,
	"is_good_boy" boolean NOT NULL -- of course he is
);
INSERT INTO "public"."doggo" ("name", "is_good_boy") VALUES ('Johnny', 't');
