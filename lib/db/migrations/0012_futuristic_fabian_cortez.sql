ALTER TABLE "contributor" ALTER COLUMN "username" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contributor" ADD COLUMN "repository_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contributor" ADD COLUMN "contributor_id" text;--> statement-breakpoint
ALTER TABLE "contributor" ADD COLUMN "contributor_node_id" text;--> statement-breakpoint
ALTER TABLE "contributor" ADD CONSTRAINT "contributor_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE cascade ON UPDATE no action;