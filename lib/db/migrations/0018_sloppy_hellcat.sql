CREATE TABLE "social_media" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date" text,
	"impressions" integer,
	"likes" integer,
	"engagements" integer,
	"bookmarks" integer,
	"shares" integer,
	"new_follows" integer,
	"unfollows" integer,
	"replies" integer,
	"reposts" integer,
	"profile_visits" integer,
	"create_post" integer,
	"video_views" integer,
	"media_views" integer,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "log" ALTER COLUMN "raw_data" SET DATA TYPE json;