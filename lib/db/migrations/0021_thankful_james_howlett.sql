CREATE TABLE "api_cache" (
	"cache_key" text PRIMARY KEY NOT NULL,
	"data" json NOT NULL,
	"updated_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
