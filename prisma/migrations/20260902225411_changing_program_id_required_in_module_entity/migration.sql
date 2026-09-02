/*
  Warnings:

  - Made the column `programId` on table `Module` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Module" ALTER COLUMN "programId" SET NOT NULL;
