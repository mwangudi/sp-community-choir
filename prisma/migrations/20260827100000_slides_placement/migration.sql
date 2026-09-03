-- Generalise the login carousel into a shared Slide table so the homepage
-- hero can be configured the same way. Renamed rather than recreated to keep
-- the existing login slides.
RENAME TABLE `LoginSlide` TO `Slide`;

ALTER TABLE `Slide`
    ADD COLUMN `placement` ENUM('LOGIN', 'HERO') NOT NULL DEFAULT 'LOGIN',
    ADD COLUMN `kicker` VARCHAR(191) NULL,
    ADD COLUMN `title` VARCHAR(191) NULL,
    ADD COLUMN `focus` VARCHAR(191) NULL;

DROP INDEX `LoginSlide_isActive_sortOrder_idx` ON `Slide`;

CREATE INDEX `Slide_placement_isActive_sortOrder_idx` ON `Slide`(`placement`, `isActive`, `sortOrder`);
