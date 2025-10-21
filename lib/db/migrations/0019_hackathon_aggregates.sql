CREATE TABLE IF NOT EXISTS "developer_summary" (
  "id" text PRIMARY KEY NOT NULL,
  "window" text NOT NULL,
  "email" text,
  "display_name" text,
  "commit_count" integer NOT NULL DEFAULT 0,
  "repo_count" integer NOT NULL DEFAULT 0,
  "first_commit_at" timestamp,
  "last_commit_at" timestamp,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "repo_summary" (
  "id" text PRIMARY KEY NOT NULL,
  "window" text NOT NULL,
  "repository_id" text NOT NULL REFERENCES "repository"("id") ON DELETE cascade,
  "full_name" text,
  "commit_count" integer NOT NULL DEFAULT 0,
  "developer_count" integer NOT NULL DEFAULT 0,
  "last_commit_at" timestamp,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mad_cache_28d" (
  "date" text PRIMARY KEY NOT NULL,
  "unique_developer_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aggregate_job_log" (
  "id" text PRIMARY KEY NOT NULL,
  "job_name" text NOT NULL,
  "status" text NOT NULL,
  "message" text,
  "started_at" timestamp NOT NULL,
  "finished_at" timestamp NOT NULL
);


