CREATE TABLE "aggregate_job_log" (
	"id" text PRIMARY KEY NOT NULL,
	"job_name" text NOT NULL,
	"status" text NOT NULL,
	"message" text,
	"started_at" timestamp NOT NULL,
	"finished_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "developer_summary" (
	"id" text PRIMARY KEY NOT NULL,
	"window" text NOT NULL,
	"email" text,
	"display_name" text,
	"commit_count" integer DEFAULT 0 NOT NULL,
	"repo_count" integer DEFAULT 0 NOT NULL,
	"first_commit_at" timestamp,
	"last_commit_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mad_cache_28d" (
	"date" text PRIMARY KEY NOT NULL,
	"unique_developer_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repo_summary" (
	"id" text PRIMARY KEY NOT NULL,
	"window" text NOT NULL,
	"repository_id" text NOT NULL,
	"full_name" text,
	"commit_count" integer DEFAULT 0 NOT NULL,
	"developer_count" integer DEFAULT 0 NOT NULL,
	"last_commit_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "repository" ADD COLUMN "is_fork" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "repo_summary" ADD CONSTRAINT "repo_summary_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE cascade ON UPDATE no action;