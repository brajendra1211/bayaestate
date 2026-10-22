-- AlterTable
ALTER TABLE `Project` ADD COLUMN `projectType` VARCHAR(191) NULL,
    ADD COLUMN `totalUnits` INTEGER NULL,
    ADD COLUMN `projectSizeAcres` DOUBLE NULL,
    ADD COLUMN `launchDate` DATETIME(3) NULL,
    ADD COLUMN `totalTowers` INTEGER NULL,
    ADD COLUMN `pricePerSqft` INTEGER NULL,
    ADD COLUMN `priceListUrl` VARCHAR(191) NULL,
    ADD COLUMN `carParkingSpaces` INTEGER NULL,
    ADD COLUMN `unitLiftRatio` VARCHAR(191) NULL,
    ADD COLUMN `approvalDate` DATETIME(3) NULL,
    ADD COLUMN `constructionStatusNote` TEXT NULL;

-- CreateTable
CREATE TABLE `ProjectReraPhase` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `reraNumber` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `ProjectReraPhase_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProjectReraPhase` ADD CONSTRAINT `ProjectReraPhase_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
