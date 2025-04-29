ALTER TABLE "commit" ADD COLUMN "last_scanned_at" timestamp;--> statement-breakpoint
ALTER TABLE "contributor" ADD COLUMN "last_scanned_at" timestamp;--> statement-breakpoint
ALTER TABLE "developer" ADD COLUMN "last_scanned_at" timestamp;--> statement-breakpoint
ALTER TABLE "log" ADD COLUMN "last_scanned_at" timestamp;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "last_scanned_at" timestamp;--> statement-breakpoint
ALTER TABLE "project_dune_dashboard" ADD COLUMN "last_scanned_at" timestamp;--> statement-breakpoint
ALTER TABLE "project_repository" ADD COLUMN "last_scanned_at" timestamp;--> statement-breakpoint
ALTER TABLE "repository" ADD COLUMN "remark" text DEFAULT 'external';--> statement-breakpoint
ALTER TABLE "repository" ADD COLUMN "last_scanned_at" timestamp;--> statement-breakpoint
ALTER TABLE "repository_contributors" ADD COLUMN "last_scanned_at" timestamp;--> statement-breakpoint
ALTER TABLE "repository_stats" ADD COLUMN "last_scanned_at" timestamp;