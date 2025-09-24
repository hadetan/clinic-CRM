-- CreateEnum
CREATE TYPE "public"."DispensingUnit" AS ENUM ('TABLET', 'CAPSULE', 'BOTTLE', 'VIAL', 'ML', 'MG', 'SACHET', 'TUBE', 'INJECTION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PrescriptionType" AS ENUM ('PACKS', 'UNITS');

-- AlterTable
ALTER TABLE "public"."PrescriptionItem" ADD COLUMN     "prescribedAs" "public"."PrescriptionType" NOT NULL DEFAULT 'UNITS',
ADD COLUMN     "unitsPerPack" INTEGER;

-- AlterTable
ALTER TABLE "public"."Stock" ADD COLUMN     "dispensingUnit" "public"."DispensingUnit" NOT NULL DEFAULT 'TABLET',
ADD COLUMN     "isDivisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "unitsPerPack" INTEGER NOT NULL DEFAULT 1;
