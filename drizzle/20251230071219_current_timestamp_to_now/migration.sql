ALTER TABLE "Member" ALTER COLUMN "fresh_until" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "fresh_until" SET DEFAULT now();