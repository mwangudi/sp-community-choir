-- The lectionary year is optional; the worship aid prints it only when set.
ALTER TABLE `MassPlan` MODIFY `year` CHAR(1) NULL;
