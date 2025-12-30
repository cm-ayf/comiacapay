-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Display" (
	"event_id" text,
	"item_id" text,
	"price" integer NOT NULL,
	"internal_price" integer,
	"dedication" boolean DEFAULT false NOT NULL,
	CONSTRAINT "Display_pkey" PRIMARY KEY("event_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "Event" (
	"id" text PRIMARY KEY,
	"guild_id" text NOT NULL,
	"name" text NOT NULL,
	"date" timestamp(3) NOT NULL,
	"discounts" jsonb DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Guild" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"picture" text,
	"read_role_id" text,
	"register_role_id" text,
	"write_role_id" text
);
--> statement-breakpoint
CREATE TABLE "Item" (
	"id" text PRIMARY KEY,
	"guild_id" text NOT NULL,
	"name" text NOT NULL,
	"picture" text,
	"issued_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Member" (
	"user_id" text,
	"guild_id" text,
	"read" boolean NOT NULL,
	"register" boolean NOT NULL,
	"write" boolean NOT NULL,
	"admin" boolean NOT NULL,
	"fresh_until" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "Member_pkey" PRIMARY KEY("user_id","guild_id")
);
--> statement-breakpoint
CREATE TABLE "Receipt" (
	"id" text PRIMARY KEY,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"total" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Record" (
	"receipt_id" text,
	"event_id" text NOT NULL,
	"item_id" text,
	"count" integer NOT NULL,
	"internal" boolean DEFAULT false NOT NULL,
	"dedication" boolean DEFAULT false NOT NULL,
	CONSTRAINT "Record_pkey" PRIMARY KEY("receipt_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" text PRIMARY KEY,
	"sid" text NOT NULL,
	"user_id" text,
	"token_result" jsonb,
	"expires" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY,
	"name" text,
	"username" text NOT NULL,
	"picture" text,
	"fresh_until" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "Session_sid_key" ON "Session" ("sid");--> statement-breakpoint
ALTER TABLE "Member" ADD CONSTRAINT "Member_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Member" ADD CONSTRAINT "Member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Item" ADD CONSTRAINT "Item_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Display" ADD CONSTRAINT "Display_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Display" ADD CONSTRAINT "Display_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Record" ADD CONSTRAINT "Record_event_id_item_id_fkey" FOREIGN KEY ("event_id","item_id") REFERENCES "Display"("event_id","item_id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Record" ADD CONSTRAINT "Record_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
*/