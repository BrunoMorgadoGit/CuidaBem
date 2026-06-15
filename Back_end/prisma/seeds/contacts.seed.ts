import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const emergencyContacts = [
  { id: 'emergency-samu', numero: '192', nome: 'SAMU', detalhe: 'Urgências médicas', tom: 'samu', ordem: 1 },
  { id: 'emergency-firefighters', numero: '193', nome: 'Bombeiros', detalhe: 'Resgate e emergências', tom: 'fire', ordem: 2 },
  { id: 'emergency-human-rights', numero: '100', nome: 'Disque 100', detalhe: 'Denúncia de violações de direitos humanos', tom: 'rights', ordem: 3 },
  { id: 'emergency-cvv', numero: '188', nome: 'CVV', detalhe: 'Apoio emocional 24h', tom: 'cvv', ordem: 4 },
];

export async function seedContacts(
  prisma: PrismaClient,
  contexto: { userId: string; patientId: string }
): Promise<void> {
  for (const contact of emergencyContacts) {
    await prisma.$executeRaw`
      INSERT INTO emergency_contact (id, numero, nome, detalhe, tom, ordem, ativo)
      VALUES (${contact.id}, ${contact.numero}, ${contact.nome}, ${contact.detalhe}, ${contact.tom}, ${contact.ordem}, true)
      ON DUPLICATE KEY UPDATE
        numero = VALUES(numero),
        nome = VALUES(nome),
        detalhe = VALUES(detalhe),
        tom = VALUES(tom),
        ordem = VALUES(ordem),
        ativo = VALUES(ativo)
    `;
  }

  const supportContacts = [
    { nome: 'Profissional de Saúde Exemplo', papel: 'Atendimento clínico', telefone: '(00) 00000-0000' },
    { nome: 'Familiar Responsável Exemplo', papel: 'Contato familiar', telefone: '(00) 00000-0000' },
    { nome: 'Serviço de Apoio Exemplo', papel: 'Atendimento 24h', telefone: '(00) 00000-0000' },
  ];

  for (const contact of supportContacts) {
    const existentes = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM support_contact
      WHERE patient_id = ${contexto.patientId}
        AND nome = ${contact.nome}
      LIMIT 1
    `;
    const existente = existentes[0];

    if (existente) {
      await prisma.$executeRaw`
        UPDATE support_contact
        SET
          papel = ${contact.papel},
          telefone = ${contact.telefone},
          ativo = true,
          created_by_user_id = ${contexto.userId},
          atualizado_em = CURRENT_TIMESTAMP(3)
        WHERE id = ${existente.id}
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO support_contact (
          id,
          patient_id,
          created_by_user_id,
          nome,
          papel,
          telefone,
          ativo
        )
        VALUES (
          ${randomUUID()},
          ${contexto.patientId},
          ${contexto.userId},
          ${contact.nome},
          ${contact.papel},
          ${contact.telefone},
          true
        )
      `;
    }
  }

  console.log(`Contatos seedados: ${emergencyContacts.length} globais e ${supportContacts.length} de apoio.`);
}
