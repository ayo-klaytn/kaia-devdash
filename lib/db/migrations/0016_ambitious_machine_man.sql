ALTER TABLE "developer" ALTER COLUMN "address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "developer" ALTER COLUMN "community_rank" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "community_rank" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "maturity_rank" DROP NOT NULL;