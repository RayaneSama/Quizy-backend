/*
  Warnings:

  - Added the required column `courseId` to the `Attempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "courseId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Attempt_courseId_idx" ON "Attempt"("courseId");

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
