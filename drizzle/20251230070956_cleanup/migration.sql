DROP TABLE "_prisma_migrations";--> statement-breakpoint
ALTER TABLE "Display" RENAME CONSTRAINT "Display_event_id_fkey" TO "Display_event_id_Event_id_fkey";--> statement-breakpoint
ALTER TABLE "Display" RENAME CONSTRAINT "Display_item_id_fkey" TO "Display_item_id_Item_id_fkey";--> statement-breakpoint
ALTER TABLE "Event" RENAME CONSTRAINT "Event_guild_id_fkey" TO "Event_guild_id_Guild_id_fkey";--> statement-breakpoint
ALTER TABLE "Item" RENAME CONSTRAINT "Item_guild_id_fkey" TO "Item_guild_id_Guild_id_fkey";--> statement-breakpoint
ALTER TABLE "Member" RENAME CONSTRAINT "Member_user_id_fkey" TO "Member_user_id_User_id_fkey";--> statement-breakpoint
ALTER TABLE "Member" RENAME CONSTRAINT "Member_guild_id_fkey" TO "Member_guild_id_Guild_id_fkey";--> statement-breakpoint
ALTER TABLE "Receipt" RENAME CONSTRAINT "Receipt_event_id_fkey" TO "Receipt_event_id_Event_id_fkey";--> statement-breakpoint
ALTER TABLE "Receipt" RENAME CONSTRAINT "Receipt_user_id_fkey" TO "Receipt_user_id_User_id_fkey";--> statement-breakpoint
ALTER TABLE "Record" RENAME CONSTRAINT "Record_receipt_id_fkey" TO "Record_receipt_id_Receipt_id_fkey";--> statement-breakpoint
ALTER TABLE "Record" RENAME CONSTRAINT "Record_event_id_item_id_fkey" TO "Record_event_id_item_id_Display_event_id_item_id_fkey";--> statement-breakpoint
ALTER TABLE "Session" RENAME CONSTRAINT "Session_user_id_fkey" TO "Session_user_id_User_id_fkey";
