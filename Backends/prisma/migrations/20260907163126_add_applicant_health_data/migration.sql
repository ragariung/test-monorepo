-- CreateEnum
CREATE TYPE "SmokingStatus" AS ENUM ('NEVER', 'FORMER', 'CURRENT');

-- CreateEnum
CREATE TYPE "AlcoholUse" AS ENUM ('NEVER', 'OCCASIONAL', 'REGULAR');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "alcoholUse" "AlcoholUse",
ADD COLUMN     "applicantHeightCm" INTEGER,
ADD COLUMN     "applicantWeightKg" DOUBLE PRECISION,
ADD COLUMN     "medicalHistory" TEXT,
ADD COLUMN     "smokingStatus" "SmokingStatus";
