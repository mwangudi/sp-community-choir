-- AlterTable
ALTER TABLE `JoinApplication` ADD COLUMN `consentAt` DATETIME(3) NULL,
    ADD COLUMN `consentVersion` VARCHAR(191) NULL,
    ADD COLUMN `mediaConsent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `privacyConsent` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Member` ADD COLUMN `consentAt` DATETIME(3) NULL,
    ADD COLUMN `consentVersion` VARCHAR(191) NULL,
    ADD COLUMN `mediaConsent` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Song` ADD COLUMN `copyrightStatus` ENUM('PUBLIC_DOMAIN', 'LICENSED', 'COPYRIGHTED', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    ADD COLUMN `licenceRef` VARCHAR(191) NULL,
    ADD COLUMN `rightsCheckedAt` DATETIME(3) NULL,
    ADD COLUMN `rightsHolder` VARCHAR(191) NULL,
    ADD COLUMN `sourceUrl` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Post` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NULL,
    `body` LONGTEXT NOT NULL,
    `coverImage` VARCHAR(191) NULL,
    `category` ENUM('EVENT', 'REFLECTION', 'PATRON_SAINT', 'NEWS') NOT NULL DEFAULT 'NEWS',
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `tags` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NULL,

    UNIQUE INDEX `Post_slug_key`(`slug`),
    INDEX `Post_status_publishedAt_idx`(`status`, `publishedAt`),
    INDEX `Post_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Song_copyrightStatus_idx` ON `Song`(`copyrightStatus`);

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
