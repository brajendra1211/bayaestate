-- AlterTable
ALTER TABLE `property` ADD COLUMN `expiresAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `subscription` MODIFY `status` ENUM('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE';
