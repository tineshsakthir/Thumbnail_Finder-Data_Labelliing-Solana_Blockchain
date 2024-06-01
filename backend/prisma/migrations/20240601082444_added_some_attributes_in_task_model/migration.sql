/*
  Warnings:

  - You are about to drop the column `submittedImagesUrl` on the `DataLabelSubmissionCache` table. All the data in the column will be lost.
  - You are about to drop the column `remainingWorkers` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `targetWorkerCount` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailChoosenCount` on the `ThumbnailSubmissionCache` table. All the data in the column will be lost.
  - Added the required column `remaining_workers` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target_worker_count` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail_choosen_count` to the `ThumbnailSubmissionCache` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DataLabelSubmissionCache" DROP COLUMN "submittedImagesUrl",
ADD COLUMN     "submitted_images_url" TEXT[];

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "remainingWorkers",
DROP COLUMN "targetWorkerCount",
ADD COLUMN     "remaining_workers" INTEGER NOT NULL,
ADD COLUMN     "target_worker_count" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ThumbnailSubmissionCache" DROP COLUMN "thumbnailChoosenCount",
ADD COLUMN     "thumbnail_choosen_count" JSONB NOT NULL;
