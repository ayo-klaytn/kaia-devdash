CREATE TABLE "commit" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_id" text NOT NULL,
	"committer_name" text NOT NULL,
	"committer_email" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contributor" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "developer" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"github" text NOT NULL,
	"address" text NOT NULL,
	"community_rank" integer NOT NULL,
	"x_handle" text,
	"bootcamp_graduated" timestamp,
	"bootcamp_contributor" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"url" text NOT NULL,
	"twitter" text,
	"github" text,
	"community_rank" integer NOT NULL,
	"maturity_rank" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_dune_dashboard" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"description" text NOT NULL,
	"width" text NOT NULL,
	"height" text NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_repository" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository" (
	"id" text PRIMARY KEY NOT NULL,
	"owner" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository_contributors" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_id" text NOT NULL,
	"contributor_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_id" text NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL,
	"forks" integer DEFAULT 0 NOT NULL,
	"watchers" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commit" ADD CONSTRAINT "commit_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_dune_dashboard" ADD CONSTRAINT "project_dune_dashboard_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_repository" ADD CONSTRAINT "project_repository_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_contributors" ADD CONSTRAINT "repository_contributors_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_contributors" ADD CONSTRAINT "repository_contributors_contributor_id_contributor_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "public"."contributor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_stats" ADD CONSTRAINT "repository_stats_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE cascade ON UPDATE no action;