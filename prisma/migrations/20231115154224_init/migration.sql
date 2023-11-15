-- CreateTable
CREATE TABLE `User` (
    `id` CHAR(20) NOT NULL,
    `name` VARCHAR(191) NULL,
    `username` VARCHAR(191) NOT NULL,
    `picture` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Guild` (
    `id` CHAR(20) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `picture` VARCHAR(191) NULL,
    `read_role_id` CHAR(20) NULL,
    `register_role_id` CHAR(20) NULL,
    `write_role_id` CHAR(20) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Member` (
    `user_id` CHAR(20) NOT NULL,
    `guild_id` CHAR(20) NOT NULL,
    `read` BOOLEAN NOT NULL,
    `register` BOOLEAN NOT NULL,
    `write` BOOLEAN NOT NULL,
    `admin` BOOLEAN NOT NULL,

    INDEX `Member_user_id_idx`(`user_id`),
    INDEX `Member_guild_id_idx`(`guild_id`),
    PRIMARY KEY (`user_id`, `guild_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` CHAR(20) NOT NULL,
    `guild_id` CHAR(20) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `picture` VARCHAR(191) NULL,
    `issued_at` DATETIME(3) NOT NULL,

    INDEX `Item_guild_id_idx`(`guild_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` CHAR(20) NOT NULL,
    `guild_id` CHAR(20) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `discounts` JSON NOT NULL,

    INDEX `Event_guild_id_idx`(`guild_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Display` (
    `event_id` CHAR(20) NOT NULL,
    `item_id` CHAR(20) NOT NULL,
    `price` INTEGER NOT NULL,
    `internal_price` INTEGER NULL,
    `dedication` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Display_event_id_idx`(`event_id`),
    INDEX `Display_item_id_idx`(`item_id`),
    PRIMARY KEY (`event_id`, `item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Receipt` (
    `id` CHAR(36) NOT NULL,
    `event_id` CHAR(20) NOT NULL,
    `user_id` CHAR(20) NOT NULL,
    `total` INTEGER NOT NULL,

    INDEX `Receipt_event_id_idx`(`event_id`),
    INDEX `Receipt_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Record` (
    `receipt_id` CHAR(36) NOT NULL,
    `event_id` CHAR(20) NOT NULL,
    `item_id` CHAR(20) NOT NULL,
    `count` INTEGER NOT NULL,
    `internal` BOOLEAN NOT NULL DEFAULT false,
    `dedication` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Record_receipt_id_idx`(`receipt_id`),
    INDEX `Record_event_id_item_id_idx`(`event_id`, `item_id`),
    PRIMARY KEY (`receipt_id`, `item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
