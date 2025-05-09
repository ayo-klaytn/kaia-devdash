ALTER TABLE "commit" ALTER COLUMN "committer_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "commit" ALTER COLUMN "committer_email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "commit" ALTER COLUMN "timestamp" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "commit" ALTER COLUMN "url" DROP NOT NULL;