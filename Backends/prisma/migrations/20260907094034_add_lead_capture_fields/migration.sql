-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "applicantEmail" DROP NOT NULL,
ALTER COLUMN "applicantPhone" DROP NOT NULL,
ALTER COLUMN "applicantAge" DROP NOT NULL,
ALTER COLUMN "applicantCity" DROP NOT NULL,
ALTER COLUMN "preferredContactTime" DROP NOT NULL,
ALTER COLUMN "simulationSnapshot" DROP NOT NULL;
