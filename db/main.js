import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

await prisma.$transaction([
  prisma.catalog.deleteMany({}),
  prisma.course.deleteMany({}),
  prisma.department.deleteMany({}),
  prisma.major.deleteMany({}),
  prisma.majorRequirements.deleteMany({}),
  prisma.minor.deleteMany({}),
  prisma.minorRequirements.deleteMany({}),
  prisma.plan.deleteMany({}),
  prisma.prerequisite.deleteMany({}),
  prisma.user.deleteMany({}),
]);