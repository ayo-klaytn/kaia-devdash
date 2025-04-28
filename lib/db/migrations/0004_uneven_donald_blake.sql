CREATE TABLE "log" (
	"id" text PRIMARY KEY NOT NULL,
	"log_code" text NOT NULL,
	"message" text NOT NULL,
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
