/*
  Warnings:

  - Added the required column `remainingWorkers` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetWorkerCount` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "remainingWorkers" INTEGER NOT NULL,
ADD COLUMN     "targetWorkerCount" INTEGER NOT NULL;
