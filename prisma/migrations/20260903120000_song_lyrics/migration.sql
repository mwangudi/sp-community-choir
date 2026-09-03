-- Full sung text for each song, so the Sunday worship aid can be generated
-- from the repertoire instead of retyped.
ALTER TABLE `Song` ADD COLUMN `lyrics` LONGTEXT NULL;
