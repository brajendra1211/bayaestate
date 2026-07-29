-- AlterTable
ALTER TABLE `project` ADD COLUMN `reraNumber` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `property` ADD COLUMN `condition` ENUM('NEW_BOOKING', 'RESALE') NULL;
