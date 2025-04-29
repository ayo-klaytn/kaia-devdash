ALTER TABLE "commit" DROP COLUMN "last_scanned_at";--> statement-breakpoint
ALTER TABLE "contributor" DROP COLUMN "last_scanned_at";--> statement-breakpoint
ALTER TABLE "developer" DROP COLUMN "last_scanned_at";--> statement-breakpoint
ALTER TABLE "log" DROP COLUMN "last_scanned_at";--> statement-breakpoint
ALTER TABLE "project" DROP COLUMN "last_scanned_at";--> statement-breakpoint
ALTER TABLE "project_dune_dashboard" DROP COLUMN "last_scanned_at";--> statement-breakpoint
ALTER TABLE "project_repository" DROP COLUMN "last_scanned_at";--> statement-breakpoint
ALTER TABLE "repository" DROP COLUMN "last_scanned_at";--> statement-breakpoint
ALTER TABLE "repository_contributors" DROP COLUMN "last_scanned_at";--> statement-breakpoint
ALTER TABLE "repository_stats" DROP COLUMN "last_scanned_at";