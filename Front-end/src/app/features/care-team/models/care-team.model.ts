export type CaregiverRole = 'responsible' | 'family' | 'caregiver' | 'nurse';

export interface CareTeamMember {
  id: string;
  patientId: string;
  userId: string;
  role: CaregiverRole;
  active: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const CAREGIVER_ROLE_LABELS: Record<CaregiverRole, string> = {
  responsible: 'Cuidador Principal',
  family: 'Familiar',
  caregiver: 'Cuidador',
  nurse: 'Enfermeiro(a)'
};

export const CAREGIVER_ROLE_OPTIONS: { value: CaregiverRole; label: string }[] = [
  { value: 'responsible', label: 'Cuidador Principal' },
  { value: 'family', label: 'Familiar' },
  { value: 'caregiver', label: 'Cuidador' },
  { value: 'nurse', label: 'Enfermeiro(a)' }
];
