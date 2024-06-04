/*
  Warnings:

  - Added the required column `option_number` to the `Options` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Options" ADD COLUMN     "option_number" INTEGER NOT NULL;
