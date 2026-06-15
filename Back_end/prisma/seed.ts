import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { seedPhase3 } from './seeds/phase3.seed';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Iniciando seed do banco de dados CuidaBem...\n');

  const passwordHash = await bcrypt.hash('Admin@123456', 12);

  const account = await prisma.account.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: { name: 'Família Cuida Bem' },
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Família Cuida Bem',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'admin@cuidabem.com.br' },
    update: {
      name: 'Administrador CuidaBem',
      passwordHash,
      active: true,
      role: 'RESPONSIBLE',
    },
    create: {
      accountId: account.id,
      name: 'Administrador CuidaBem',
      email: 'admin@cuidabem.com.br',
      passwordHash,
      cpf: '00000000000',
      phone: '11999999999',
      role: 'RESPONSIBLE',
    },
  });

  const patient = await prisma.patient.upsert({
    where: { id: '00000000-0000-4000-8000-000000000101' },
    update: {
      name: 'Maria Aparecida Santos',
      status: 'ACTIVE',
    },
    create: {
      id: '00000000-0000-4000-8000-000000000101',
      accountId: account.id,
      name: 'Maria Aparecida Santos',
      birthDate: new Date('1946-03-15'),
      cpf: '12345678901',
      sex: 'F',
      weight: 62.5,
      healthConditions: ['Hipertensão Arterial', 'Diabetes Tipo 2', 'Osteoporose'],
    },
  });

  await prisma.patientMember.upsert({
    where: {
      patientId_userId: {
        patientId: patient.id,
        userId: user.id,
      },
    },
    update: {
      role: 'RESPONSIBLE',
      active: true,
    },
    create: {
      accountId: account.id,
      patientId: patient.id,
      userId: user.id,
      role: 'RESPONSIBLE',
    },
  });

  await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: { currentPatientId: patient.id },
    create: {
      userId: user.id,
      currentPatientId: patient.id,
    },
  });

  await seedPhase3(prisma, { userId: user.id, patientId: patient.id });

  console.log('\nSeed concluído com sucesso!');
  console.log('─────────────────────────────────────────────');
  console.log('Login:  admin@cuidabem.com.br');
  console.log('Senha:  Admin@123456');
  console.log('─────────────────────────────────────────────\n');
}

main()
  .catch((error) => {
    console.error('Erro no seed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
