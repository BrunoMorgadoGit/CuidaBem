export interface UserProfile {
  id: string;
  photo: string;
  fullName: string;
  age: number | null;
  birthDate: string;
  phone: string;
  emergencyPhone: string;
  mainCaregiver: string;
  responsibleFamilyMember: string;
  healthConditions: string[];
  medications: string[];
  allergies: string[];
  notes: string;
}

export const USER_PROFILE_STORAGE_KEY_PREFIX = 'cuidabem_user_profile';

export const EMPTY_USER_PROFILE: UserProfile = {
  id: 'local-profile',
  photo: '',
  fullName: '',
  age: null,
  birthDate: '',
  phone: '',
  emergencyPhone: '',
  mainCaregiver: '',
  responsibleFamilyMember: '',
  healthConditions: [],
  medications: [],
  allergies: [],
  notes: ''
};
