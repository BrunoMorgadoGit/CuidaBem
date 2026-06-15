import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PageShellComponent } from '../../../shared/components/page-shell/page-shell.component';
import { PatientService } from '../../../core/services/patient.service';
import { UserService } from '../../../core/services/user.service';
import { CareTeamService } from '../services/care-team.service';
import {
  CAREGIVER_ROLE_LABELS,
  CAREGIVER_ROLE_OPTIONS,
  type CaregiverRole,
  type CareTeamMember
} from '../models';

@Component({
  selector: 'app-care-team',
  standalone: true,
  imports: [CommonModule, FormsModule, PageShellComponent],
  templateUrl: './care-team.page.html',
  styleUrls: ['./care-team.page.css']
})
export class CareTeamPage implements OnInit {
  private readonly careTeamService = inject(CareTeamService);
  private readonly patientService = inject(PatientService);
  private readonly userService = inject(UserService);

  members: CareTeamMember[] = [];
  loading = true;
  error = '';
  feedback = '';

  addOpen = false;
  addEmail = '';
  addRole: CaregiverRole = 'family';
  addError = '';
  addLoading = false;

  editingMemberId: string | null = null;
  editRole: CaregiverRole = 'family';

  readonly roleLabels = CAREGIVER_ROLE_LABELS;
  readonly roleOptions = CAREGIVER_ROLE_OPTIONS;

  get patient() {
    return this.patientService.getCurrentPatient();
  }

  get currentUser() {
    return this.userService.getCurrentUser();
  }

  get patientInitials(): string {
    return this.patient.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading = true;
    this.error = '';
    this.careTeamService.listMembers(this.patient.id).subscribe({
      next: (members) => {
        this.members = members;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao carregar equipe de cuidado.';
        this.loading = false;
      }
    });
  }

  getMemberInitials(member: CareTeamMember): string {
    const name = member.user?.name || '';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '??';
  }

  getRoleLabel(role: string): string {
    return CAREGIVER_ROLE_LABELS[role as CaregiverRole] || role;
  }

  isResponsible(member: CareTeamMember): boolean {
    return member.role === 'responsible';
  }

  canRemove(member: CareTeamMember): boolean {
    if (member.userId === this.currentUser.id) return false;
    if (this.members.length <= 1) return false;
    return true;
  }

  openAdd(): void {
    this.addEmail = '';
    this.addRole = 'family';
    this.addError = '';
    this.addOpen = true;
    this.feedback = '';
  }

  closeAdd(): void {
    this.addOpen = false;
    this.addError = '';
  }

  submitAdd(): void {
    const email = this.addEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      this.addError = 'Informe um e-mail válido.';
      return;
    }

    this.addLoading = true;
    this.addError = '';

    this.careTeamService.addMember(this.patient.id, email, this.addRole).subscribe({
      next: () => {
        this.feedback = 'Cuidador vinculado com sucesso.';
        this.addOpen = false;
        this.addLoading = false;
        this.loadMembers();
      },
      error: (err) => {
        this.addLoading = false;
        const code = err.error?.errorCode;
        if (code === 'USER_NOT_FOUND') {
          this.addError = 'Usuário não encontrado. Peça para ele criar uma conta primeiro.';
        } else if (code === 'UNIQUE_CONSTRAINT_VIOLATION') {
          this.addError = 'Este cuidador já está vinculado ao paciente.';
        } else {
          this.addError = err.error?.message || 'Erro ao vincular cuidador.';
        }
      }
    });
  }

  startEdit(member: CareTeamMember): void {
    this.editingMemberId = member.id;
    this.editRole = member.role;
    this.feedback = '';
  }

  cancelEdit(): void {
    this.editingMemberId = null;
  }

  saveEdit(member: CareTeamMember): void {
    this.careTeamService.updateMember(member.id, this.editRole).subscribe({
      next: () => {
        this.editingMemberId = null;
        this.feedback = 'Papel atualizado com sucesso.';
        this.loadMembers();
      },
      error: (err) => {
        this.feedback = err.error?.message || 'Erro ao atualizar papel.';
      }
    });
  }

  removeMember(member: CareTeamMember): void {
    const name = member.user?.name || 'este membro';
    const confirmed = window.confirm(`Remover ${name} da equipe de cuidado?`);
    if (!confirmed) return;

    this.careTeamService.removeMember(member.id).subscribe({
      next: () => {
        this.feedback = 'Cuidador removido com sucesso.';
        this.loadMembers();
      },
      error: (err) => {
        const code = err.error?.errorCode;
        if (code === 'LAST_MEMBER') {
          this.feedback = 'Não é possível remover o último cuidador do paciente.';
        } else {
          this.feedback = err.error?.message || 'Erro ao remover cuidador.';
        }
      }
    });
  }
}
