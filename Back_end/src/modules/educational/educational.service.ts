import { EducationalRepository } from './educational.repository';
import { ViolenceType, EmergencyContact } from './educational.model';

export class EducationalService {
  constructor(private readonly repository: EducationalRepository) {}

  getAllViolenceTypes(): ViolenceType[] {
    const severityOrder: Record<string, number> = {
      crítica: 0,
      alta: 1,
      moderada: 2,
    };

    return this.repository
      .findAllViolenceTypes()
      .sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3));
  }

  getAllEmergencyContacts(): EmergencyContact[] {
    return this.repository
      .findAllEmergencyContacts()
      .sort((a, b) => {
        const scoreA = (a.available24h ? 2 : 0) + (a.isFree ? 1 : 0);
        const scoreB = (b.available24h ? 2 : 0) + (b.isFree ? 1 : 0);
        return scoreB - scoreA;
      });
  }
}
