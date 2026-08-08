/*
  Warnings:

  - Made the column `moduleId` on table `Question` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `attemptId` to the `UserAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttemptMode" AS ENUM ('PRACTICE', 'EXAM');

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "moduleId" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserAnswer" ADD COLUMN     "attemptId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "AttemptMode" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attempt_userId_idx" ON "Attempt"("userId");

-- CreateIndex
CREATE INDEX "Question_moduleId_idx" ON "Question"("moduleId");

-- CreateIndex
CREATE INDEX "UserAnswer_userId_idx" ON "UserAnswer"("userId");

-- CreateIndex
CREATE INDEX "UserAnswer_questionId_idx" ON "UserAnswer"("questionId");

-- CreateIndex
CREATE INDEX "UserAnswer_choiceId_idx" ON "UserAnswer"("choiceId");

-- CreateIndex
CREATE INDEX "UserAnswer_attemptId_idx" ON "UserAnswer"("attemptId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
