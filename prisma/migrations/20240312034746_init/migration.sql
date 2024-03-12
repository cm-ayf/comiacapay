-- CreateTable
CREATE TABLE "User" (
    "id" CHAR(20) NOT NULL,
    "name" TEXT,
    "username" TEXT NOT NULL,
    "picture" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" CHAR(20) NOT NULL,
    "name" TEXT NOT NULL,
    "picture" TEXT,
    "read_role_id" CHAR(20),
    "register_role_id" CHAR(20),
    "write_role_id" CHAR(20),

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "user_id" CHAR(20) NOT NULL,
    "guild_id" CHAR(20) NOT NULL,
    "read" BOOLEAN NOT NULL,
    "register" BOOLEAN NOT NULL,
    "write" BOOLEAN NOT NULL,
    "admin" BOOLEAN NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("user_id","guild_id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" CHAR(20) NOT NULL,
    "guild_id" CHAR(20) NOT NULL,
    "name" TEXT NOT NULL,
    "picture" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" CHAR(20) NOT NULL,
    "guild_id" CHAR(20) NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "discounts" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Display" (
    "event_id" CHAR(20) NOT NULL,
    "item_id" CHAR(20) NOT NULL,
    "price" INTEGER NOT NULL,
    "internal_price" INTEGER,
    "dedication" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Display_pkey" PRIMARY KEY ("event_id","item_id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" CHAR(36) NOT NULL,
    "event_id" CHAR(20) NOT NULL,
    "user_id" CHAR(20) NOT NULL,
    "total" INTEGER NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Record" (
    "receipt_id" CHAR(36) NOT NULL,
    "event_id" CHAR(20) NOT NULL,
    "item_id" CHAR(20) NOT NULL,
    "count" INTEGER NOT NULL,
    "internal" BOOLEAN NOT NULL DEFAULT false,
    "dedication" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("receipt_id","item_id")
);

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Display" ADD CONSTRAINT "Display_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Display" ADD CONSTRAINT "Display_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_event_id_item_id_fkey" FOREIGN KEY ("event_id", "item_id") REFERENCES "Display"("event_id", "item_id") ON DELETE RESTRICT ON UPDATE CASCADE;
