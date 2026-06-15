import { randomUUID } from 'crypto';
import { prisma } from '../../config/database';
import type { CreateSupportContactDto, UpdateSupportContactDto } from './contacts.schema';

const EMERGENCY_CONTACTS = [
  {
    name: 'SAMU',
    phone: '192',
    description: 'Atendimento médico de urgência',
  },
  {
    name: 'Bombeiros',
    phone: '193',
    description: 'Resgate, incêndios e emergências',
  },
  {
    name: 'Polícia Militar',
    phone: '190',
    description: 'Emergências de segurança pública',
  },
  {
    name: 'Disque Saúde',
    phone: '136',
    description: 'Orientações de saúde',
  },
] as const;

function mapSupportContact(contact: any) {
  return {
    id: contact.id,
    patientId: contact.patient_id,
    name: contact.nome,
    role: contact.papel,
    phone: contact.telefone,
  };
}

export class ContactsService {
  findEmergencyContacts() {
    return [...EMERGENCY_CONTACTS];
  }

  async findSupportContacts(patientId: string, userId: string) {
    await this.ensurePatientAccess(patientId, userId);

    const contacts = await prisma.$queryRaw<any[]>`
      SELECT id, patient_id, nome, papel, telefone
      FROM support_contact
      WHERE patient_id = ${patientId}
        AND ativo = true
      ORDER BY nome ASC
    `;

    return contacts.map(mapSupportContact);
  }

  async createSupportContact(dto: CreateSupportContactDto, userId: string) {
    await this.ensurePatientAccess(dto.patientId, userId);

    const id = randomUUID();

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
        ${id},
        ${dto.patientId},
        ${userId},
        ${dto.name},
        ${dto.role},
        ${dto.phone},
        true
      )
    `;

    return mapSupportContact(await this.findSupportContactRecord(id));
  }

  async updateSupportContact(id: string, dto: UpdateSupportContactDto, userId: string) {
    const current = await this.findSupportContactRecord(id);
    await this.ensurePatientAccess(current.patient_id, userId);

    await prisma.$executeRaw`
      UPDATE support_contact
      SET
        nome = COALESCE(${dto.name ?? null}, nome),
        papel = COALESCE(${dto.role ?? null}, papel),
        telefone = COALESCE(${dto.phone ?? null}, telefone),
        atualizado_em = CURRENT_TIMESTAMP(3)
      WHERE id = ${id}
        AND ativo = true
    `;

    return mapSupportContact(await this.findSupportContactRecord(id));
  }

  async deleteSupportContact(id: string, userId: string) {
    const current = await this.findSupportContactRecord(id);
    await this.ensurePatientAccess(current.patient_id, userId);

    await prisma.$executeRaw`
      UPDATE support_contact
      SET ativo = false,
          atualizado_em = CURRENT_TIMESTAMP(3)
      WHERE id = ${id}
    `;

    return { id, deleted: true };
  }

  private async findSupportContactRecord(id: string) {
    const contacts = await prisma.$queryRaw<any[]>`
      SELECT id, patient_id, nome, papel, telefone, ativo
      FROM support_contact
      WHERE id = ${id}
      LIMIT 1
    `;
    const contact = contacts[0];
    if (!contact || !contact.ativo) throw new Error('SUPPORT_CONTACT_NOT_FOUND');
    return contact;
  }

  private async ensurePatientAccess(patientId: string, userId: string): Promise<void> {
    const patients = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM patients
      WHERE id = ${patientId}
        AND status <> 'ARCHIVED'
      LIMIT 1
    `;
    if (!patients[0]) throw new Error('PATIENT_NOT_FOUND');

    const members = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM patient_members
      WHERE patient_id = ${patientId}
        AND user_id = ${userId}
        AND active = true
      LIMIT 1
    `;

    if (!members[0]) throw new Error('FORBIDDEN');
  }
}

export const contactsService = new ContactsService();
