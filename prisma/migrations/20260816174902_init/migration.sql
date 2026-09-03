-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'TECHNICAL', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `voice` ENUM('SOPRANO', 'ALTO', 'TENOR', 'BASS', 'INSTRUMENTALIST', 'CONDUCTOR', 'OTHER') NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Song` (
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `language` ENUM('ENGLISH', 'SWAHILI', 'LATIN', 'MALAGASY', 'OTHER') NOT NULL DEFAULT 'ENGLISH',
    `composer` VARCHAR(191) NULL,
    `arranger` VARCHAR(191) NULL,
    `voicing` VARCHAR(191) NULL,
    `musicalKey` VARCHAR(191) NULL,
    `aliases` JSON NULL,
    `seasons` JSON NULL,
    `massParts` JSON NULL,
    `themes` JSON NULL,
    `scripture` JSON NULL,
    `driveFolderId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Song_title_idx`(`title`),
    INDEX `Song_language_idx`(`language`),
    PRIMARY KEY (`slug`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MassPlan` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `year` CHAR(1) NOT NULL,
    `season` ENUM('ADVENT', 'CHRISTMAS', 'ORDINARY_TIME', 'LENT', 'TRIDUUM', 'EASTER') NULL,
    `setting` VARCHAR(191) NULL,
    `leader` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NULL,

    UNIQUE INDEX `MassPlan_date_key`(`date`),
    INDEX `MassPlan_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MassPlanItem` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `part` ENUM('ENTRANCE', 'PENITENTIAL', 'KYRIE', 'GLORIA', 'RESPONSORIAL_PSALM', 'GOSPEL_ACCLAMATION', 'GOSPEL_PROCESSION', 'CREED', 'OFFERTORY', 'PREPARATION_OF_GIFTS', 'SANCTUS', 'MYSTERY_OF_FAITH', 'GREAT_AMEN', 'OUR_FATHER', 'SIGN_OF_PEACE', 'AGNUS_DEI', 'COMMUNION', 'ANIMA_CHRISTI', 'THANKSGIVING', 'RECESSIONAL', 'MARIAN_HYMN') NOT NULL,
    `song` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `songSlug` VARCHAR(191) NULL,

    INDEX `MassPlanItem_planId_idx`(`planId`),
    INDEX `MassPlanItem_songSlug_idx`(`songSlug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SongProposal` (
    `id` VARCHAR(191) NOT NULL,
    `sundayDate` DATE NOT NULL,
    `sundayName` VARCHAR(191) NOT NULL,
    `lectionaryYear` CHAR(1) NULL,
    `proposerName` VARCHAR(191) NOT NULL,
    `proposerEmail` VARCHAR(191) NULL,
    `voice` ENUM('SOPRANO', 'ALTO', 'TENOR', 'BASS', 'INSTRUMENTALIST', 'CONDUCTOR', 'OTHER') NULL,
    `status` ENUM('PENDING', 'REVIEWED', 'ACCEPTED', 'DECLINED') NOT NULL DEFAULT 'PENDING',
    `note` TEXT NULL,
    `reviewerNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,

    INDEX `SongProposal_sundayDate_idx`(`sundayDate`),
    INDEX `SongProposal_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SongProposalItem` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `part` ENUM('ENTRANCE', 'PENITENTIAL', 'KYRIE', 'GLORIA', 'RESPONSORIAL_PSALM', 'GOSPEL_ACCLAMATION', 'GOSPEL_PROCESSION', 'CREED', 'OFFERTORY', 'PREPARATION_OF_GIFTS', 'SANCTUS', 'MYSTERY_OF_FAITH', 'GREAT_AMEN', 'OUR_FATHER', 'SIGN_OF_PEACE', 'AGNUS_DEI', 'COMMUNION', 'ANIMA_CHRISTI', 'THANKSGIVING', 'RECESSIONAL', 'MARIAN_HYMN') NOT NULL,
    `song` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `SongProposalItem_proposalId_idx`(`proposalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Concert` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `venue` VARCHAR(191) NOT NULL,
    `blurb` TEXT NOT NULL,
    `description` JSON NULL,
    `poster` VARCHAR(191) NULL,
    `pinned` BOOLEAN NOT NULL DEFAULT false,
    `ctaLabel` VARCHAR(191) NULL,
    `ctaHref` VARCHAR(191) NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Concert_slug_key`(`slug`),
    INDEX `Concert_startsAt_idx`(`startsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GalleryItem` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `kind` ENUM('PHOTO', 'VIDEO') NOT NULL,
    `src` VARCHAR(191) NULL,
    `youtubeId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `alt` VARCHAR(191) NULL,
    `caption` TEXT NULL,
    `takenOn` DATE NULL,
    `tags` JSON NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GalleryItem_slug_key`(`slug`),
    INDEX `GalleryItem_kind_idx`(`kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Member` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `voice` ENUM('SOPRANO', 'ALTO', 'TENOR', 'BASS', 'INSTRUMENTALIST', 'CONDUCTOR', 'OTHER') NULL,
    `jumuiya` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `joinedOn` DATE NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Member_voice_idx`(`voice`),
    INDEX `Member_lastName_idx`(`lastName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JoinApplication` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `voice` ENUM('SOPRANO', 'ALTO', 'TENOR', 'BASS', 'INSTRUMENTALIST', 'CONDUCTOR', 'OTHER') NULL,
    `startDate` DATE NULL,
    `message` TEXT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'ACCEPTED', 'DECLINED') NOT NULL DEFAULT 'NEW',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JoinApplication_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `page` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Feedback_isRead_idx`(`isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MassPlan` ADD CONSTRAINT `MassPlan_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MassPlanItem` ADD CONSTRAINT `MassPlanItem_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `MassPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MassPlanItem` ADD CONSTRAINT `MassPlanItem_songSlug_fkey` FOREIGN KEY (`songSlug`) REFERENCES `Song`(`slug`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SongProposal` ADD CONSTRAINT `SongProposal_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SongProposalItem` ADD CONSTRAINT `SongProposalItem_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `SongProposal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
