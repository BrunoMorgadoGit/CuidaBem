import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthSessionService } from '../../../core/services/auth-session.service';
import { ActivityLogService, PatientService, TaskService, UserService } from '../../../core/services';
import { PageShellComponent } from '../../../shared/components';
import { type UserProfile } from '../models';
import { ProfileService } from '../services';

const PHONE_PATTERN = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
const NOTES_LIMIT = 500;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, PageShellComponent, ReactiveFormsModule],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly authSession = inject(AuthSessionService);
  private readonly userService = inject(UserService);
  private readonly patientService = inject(PatientService);
  private readonly taskService = inject(TaskService);
  private readonly activityLogService = inject(ActivityLogService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  profile: UserProfile = this.profileService.getProfile();
  showDetails = false;
  isEditing = false;
  pendingPhoto = '';
  feedback = '';
  photoError = '';

  readonly notesLimit = NOTES_LIMIT;

  readonly profileForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(90)]],
    age: [null as number | null, [Validators.min(0), Validators.max(130)]],
    birthDate: ['', [this.validBirthDate]],
    phone: ['', [Validators.pattern(PHONE_PATTERN)]],
    emergencyPhone: ['', [Validators.pattern(PHONE_PATTERN)]],
    mainCaregiver: ['', [Validators.maxLength(80)]],
    responsibleFamilyMember: ['', [Validators.maxLength(80)]],
    healthConditionsText: ['', [Validators.maxLength(300)]],
    medicationsText: ['', [Validators.maxLength(300)]],
    allergiesText: ['', [Validators.maxLength(300)]],
    notes: ['', [Validators.maxLength(NOTES_LIMIT)]]
  });

  ngOnInit(): void {
    this.profile = this.profileService.refreshCurrentProfile();
    this.resetForm(this.profile);
    this.profileForm.disable();
  }

  get initials(): string {
    const source = this.profile.fullName || 'CuidaBem';
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  get displayName(): string {
    return this.profile.fullName || 'Perfil do idoso';
  }

  get displayAge(): string {
    return this.profile.age === null ? 'Idade nao informada' : `${this.profile.age} anos`;
  }

  get displayCaregiver(): string {
    return this.profile.mainCaregiver || 'Cuidador nao informado';
  }

  get editPhoto(): string {
    return this.pendingPhoto;
  }

  get notesLength(): number {
    return this.profileForm.controls.notes.value?.length ?? 0;
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
    this.isEditing = false;
    this.profileForm.disable();
    this.feedback = '';
    this.photoError = '';
  }

  goToCareTeam(): void {
    this.router.navigate(['/equipe']);
  }

  editProfile(): void {
    this.isEditing = true;
    this.showDetails = false;
    this.pendingPhoto = this.profile.photo;
    this.feedback = '';
    this.photoError = '';
    this.resetForm(this.profile);
    this.profileForm.enable();
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.feedback = '';
    this.photoError = '';
    this.pendingPhoto = '';
    this.resetForm(this.profile);
    this.profileForm.disable();
  }

  saveProfile(): void {
    this.profileForm.markAllAsTouched();

    if (this.profileForm.invalid) {
      this.feedback = 'Revise os campos destacados antes de salvar.';
      return;
    }

    const rawProfile = this.profileForm.getRawValue();
    const updatedProfile: UserProfile = {
      ...this.profile,
      photo: this.pendingPhoto,
      fullName: rawProfile.fullName?.trim() ?? '',
      age: rawProfile.age === null ? null : Number(rawProfile.age),
      birthDate: rawProfile.birthDate?.trim() ?? '',
      phone: rawProfile.phone?.trim() ?? '',
      emergencyPhone: rawProfile.emergencyPhone?.trim() ?? '',
      mainCaregiver: rawProfile.mainCaregiver?.trim() ?? '',
      responsibleFamilyMember: rawProfile.responsibleFamilyMember?.trim() ?? '',
      healthConditions: this.parseList(rawProfile.healthConditionsText),
      medications: this.parseList(rawProfile.medicationsText),
      allergies: this.parseList(rawProfile.allergiesText),
      notes: rawProfile.notes?.trim() ?? ''
    };

    this.profile = this.profileService.updateProfile(updatedProfile);
    this.resetForm(this.profile);
    this.profileForm.disable();
    this.isEditing = false;
    this.showDetails = true;
    this.pendingPhoto = '';
    this.feedback = 'Perfil atualizado.';
  }

  removePhoto(): void {
    if (this.isEditing) {
      this.pendingPhoto = '';
      this.photoError = '';
      return;
    }

    this.photoError = '';
    this.profile = this.profileService.removePhoto();
    this.feedback = 'Foto removida.';
  }

  async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      this.photoError = '';
      this.pendingPhoto = await this.profileService.uploadOrStorePhoto(file);
      this.feedback = '';
    } catch {
      this.photoError = 'Nao foi possivel usar esta imagem.';
    } finally {
      input.value = '';
    }
  }

  fieldError(fieldName: keyof typeof this.profileForm.controls): string {
    const control = this.profileForm.controls[fieldName];

    if (!control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Campo obrigatorio.';
    }

    if (control.errors['min'] || control.errors['max']) {
      return 'Informe uma idade entre 0 e 130.';
    }

    if (control.errors['pattern']) {
      return 'Use um telefone valido. Ex: (14) 99999-9999.';
    }

    if (control.errors['invalidDate']) {
      return 'Informe uma data de nascimento valida.';
    }

    if (control.errors['maxlength']) {
      return 'Texto acima do limite permitido.';
    }

    return 'Campo invalido.';
  }

  formatBirthDate(value: string): string {
    if (!value) {
      return 'Nao informado';
    }

    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : 'Nao informado';
  }

  formatList(items: string[]): string {
    return items.length > 0 ? items.join(', ') : 'Nao informado';
  }

  fallback(value: string): string {
    return value || 'Nao informado';
  }

  logout(): void {
    this.authSession.clearSession();
    this.userService.clearCurrentUser();
    this.patientService.clearCurrentPatient();
    this.taskService.clearLocalState();
    this.activityLogService.clearLocalState();
    this.clearLegacyAuthKeys();
    this.router.navigate(['/login']);
  }

  private resetForm(profile: UserProfile): void {
    this.profileForm.reset({
      fullName: profile.fullName,
      age: profile.age,
      birthDate: profile.birthDate,
      phone: profile.phone,
      emergencyPhone: profile.emergencyPhone,
      mainCaregiver: profile.mainCaregiver,
      responsibleFamilyMember: profile.responsibleFamilyMember,
      healthConditionsText: profile.healthConditions.join(', '),
      medicationsText: profile.medications.join(', '),
      allergiesText: profile.allergies.join(', '),
      notes: profile.notes
    });
  }

  private parseList(value: string | null | undefined): string[] {
    return (value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  private clearLegacyAuthKeys(): void {
    const authKeys = [
      'token',
      'accessToken',
      'authToken',
      'currentUser',
      'user',
      'cuidabem_user'
    ];

    authKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }

  private validBirthDate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const date = new Date(`${value}T00:00:00`);
    const today = new Date();

    if (Number.isNaN(date.getTime()) || date > today || date.getFullYear() < 1890) {
      return { invalidDate: true };
    }

    return null;
  }
}
