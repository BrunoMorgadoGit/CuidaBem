import { PrismaClient } from '@prisma/client';

export async function seedTasks(
  prisma: PrismaClient,
  contexto: { userId: string; patientId: string }
): Promise<void> {
  console.log('Semeando templates de tarefas e tarefas de exemplo...');

  const templates = [
    { id: 'tpl-medication', title: 'Medicacao', category: 'medication', icon: 'medical-outline', guideRoute: '/guia/administracao-de-medicacao' },
    { id: 'tpl-hydration', title: 'Hidratacao', category: 'hydration', icon: 'water-outline', guideRoute: '/guia/controle-de-hidratacao' },
    { id: 'tpl-bed-bath', title: 'Banho no leito', category: 'hygiene', icon: 'bed-outline', guideRoute: '/guia/banho-de-leito' },
    { id: 'tpl-diaper', title: 'Troca de fralda', category: 'hygiene', icon: 'bed-outline', guideRoute: '/guia/troca-de-fralda' },
    { id: 'tpl-exercises', title: 'Exercicios leves', category: 'exercise', icon: 'fitness-outline', guideRoute: '/tabs/health' },
    { id: 'tpl-wellbeing', title: 'Bem-estar', category: 'wellness', icon: 'heart-outline', guideRoute: '/tabs/profile' },
    { id: 'tpl-checkin', title: 'Check-in', category: 'wellness', icon: 'heart-outline', guideRoute: '/tabs/profile' },
    { id: 'tpl-observation', title: 'Observacao', category: 'observation', icon: 'document-text-outline' },
    { id: 'tpl-feeding', title: 'Alimentacao assistida', category: 'routine', icon: 'checkmark-circle-outline', guideRoute: '/guia/alimentacao-assistida' }
  ];

  for (const tpl of templates) {
    await prisma.taskTemplate.upsert({
      where: { id: tpl.id },
      update: {
        title: tpl.title,
        category: tpl.category,
        icon: tpl.icon,
        guideRoute: tpl.guideRoute,
      },
      create: {
        id: tpl.id,
        title: tpl.title,
        category: tpl.category,
        icon: tpl.icon,
        guideRoute: tpl.guideRoute,
      },
    });
  }

  // Seeding initial tasks for the default patient
  const initialTasks = [
    {
      id: 'task-initial-1',
      title: 'Medicamento da pressao',
      detail: 'Dar 1 comprimido de Losartana 50mg',
      time: '08:00',
      category: 'medication',
      priority: 'priority',
      icon: 'medical-outline',
      guideRoute: '/guia/administracao-de-medicacao',
    },
    {
      id: 'task-initial-2',
      title: 'Copos de agua',
      detail: 'Estimular a ingestao de pelo menos 200ml de agua',
      time: '10:00',
      category: 'hydration',
      priority: 'normal',
      icon: 'water-outline',
      guideRoute: '/guia/controle-de-hidratacao',
    },
    {
      id: 'task-initial-3',
      title: 'Fisioterapia domiciliar',
      detail: 'Exercicios de mobilidade e caminhada leve pela casa',
      time: '15:00',
      category: 'exercise',
      priority: 'attention',
      icon: 'fitness-outline',
      guideRoute: '/tabs/health',
    },
  ];

  for (const task of initialTasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        detail: task.detail,
        time: task.time,
        category: task.category,
        priority: task.priority,
        icon: task.icon,
        guideRoute: task.guideRoute,
        patientId: contexto.patientId,
        createdByUserId: contexto.userId,
      },
      create: {
        id: task.id,
        patientId: contexto.patientId,
        title: task.title,
        detail: task.detail,
        time: task.time,
        category: task.category,
        priority: task.priority,
        icon: task.icon,
        guideRoute: task.guideRoute,
        createdByUserId: contexto.userId,
      },
    });
  }
}
