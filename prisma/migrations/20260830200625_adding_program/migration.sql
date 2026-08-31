/*
  Warnings:

  - Made the column `programId` on table `SubscriptionPlan` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionPlan" DROP CONSTRAINT "SubscriptionPlan_programId_fkey";

-- DropIndex
DROP INDEX "Question_moduleId_idx";

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "moduleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SubscriptionPlan" ALTER COLUMN "programId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;
