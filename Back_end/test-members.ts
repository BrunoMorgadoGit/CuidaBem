import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const patient = await prisma.patient.findFirst({
    include: { members: { include: { user: true } } },
  });
  console.log(JSON.stringify(patient?.members, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
