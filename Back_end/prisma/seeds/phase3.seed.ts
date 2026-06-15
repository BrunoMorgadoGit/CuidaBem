import { PrismaClient } from '@prisma/client';
import { seedContacts } from './contacts.seed';
import { seedContent } from './content.seed';
import { seedExercises } from './exercises.seed';
import { seedTasks } from './tasks.seed';

export async function seedPhase3(
  prisma: PrismaClient,
  contexto: { userId: string; patientId: string }
): Promise<void> {
  await seedContent(prisma);
  await seedExercises(prisma);
  await seedContacts(prisma, contexto);
  await seedTasks(prisma, contexto);
}
