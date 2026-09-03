-- Review proposed songs one at a time, so a proposal can be partly accepted
-- and the accepted songs can flow into that Sunday's Mass plan.
ALTER TABLE `SongProposalItem`
    ADD COLUMN `status` ENUM('PENDING', 'REVIEWED', 'ACCEPTED', 'DECLINED') NOT NULL DEFAULT 'PENDING';

CREATE INDEX `SongProposalItem_status_idx` ON `SongProposalItem`(`status`);
