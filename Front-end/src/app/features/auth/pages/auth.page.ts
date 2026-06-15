import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import type { AuthMode } from '../../../core/models';
import { AppStateComponent } from '../../../shared/components';
import { sanitizeText, strongPasswordValidator } from '../../../shared/utils';

import { PatientService, UserService, AuthSessionService } from '../../../core/services';

type AuthControlName = 'name' | 'elderlyName' | 'email' | 'password';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [AppStateComponent, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.css'],
})
export class AuthPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly patientService = inject(PatientService);
  private readonly authSession = inject(AuthSessionService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly mode: AuthMode = this.route.snapshot.data['mode'] === 'register' ? 'register' : 'login';
  readonly authForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: this.mode === 'register'
        ? [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(80),
          Validators.pattern(/^[A-Za-zÀ-ÿ' -]+$/)
        ]
        : []
    }),
    elderlyName: new FormControl('', {
      nonNullable: true,
      validators: this.mode === 'register'
        ? [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(80),
          Validators.pattern(/^[A-Za-zÀ-ÿ' -]+$/)
        ]
        : []
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: this.mode === 'register'
        ? [Validators.required, Validators.maxLength(128), strongPasswordValidator()]
        : [Validators.required, Validators.minLength(6), Validators.maxLength(128)]
    })
  });
  submitAttempted = false;
  addTaskError = ''; // Reuse template err slot

  get isRegister(): boolean {
    return this.mode === 'register';
  }

  get passwordAutocomplete(): 'current-password' | 'new-password' {
    return this.isRegister ? 'new-password' : 'current-password';
  }

  continue(): void {
    this.submitAttempted = true;
    this.authForm.controls.name.setValue(sanitizeText(this.authForm.controls.name.value, 80));
    this.authForm.controls.elderlyName.setValue(sanitizeText(this.authForm.controls.elderlyName.value, 80));
    this.authForm.controls.email.setValue(sanitizeText(this.authForm.controls.email.value, 254).toLowerCase());

    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    const email = this.authForm.controls.email.value;
    const password = this.authForm.controls.password.value;

    if (this.isRegister) {
      const caregiverName = this.authForm.controls.name.value;
      const elderlyName = this.authForm.controls.elderlyName.value;

      this.authSession.register(caregiverName, elderlyName, email, password).subscribe({
        next: (res) => {
          this.authSession.definirToken(res.data.token, res.data.refreshToken);
          this.authSession.setSession({
            accessToken: res.data.token,
            refreshToken: res.data.refreshToken,
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
          });
          this.userService.setCurrentUser(res.data.user);
          this.patientService.setCurrentPatient(res.data.currentPatient);
          void this.router.navigateByUrl('/tabs/home');
        },
        error: (err) => {
          this.addTaskError = err.error?.message || 'Erro ao realizar o cadastro.';
        }
      });
    } else {
      this.authSession.login(email, password).subscribe({
        next: (res) => {
          this.authSession.definirToken(res.data.token, res.data.refreshToken);
          this.authSession.setSession({
            accessToken: res.data.token,
            refreshToken: res.data.refreshToken,
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
          });
          this.userService.setCurrentUser(res.data.user);
          this.patientService.setCurrentPatient(res.data.currentPatient);
          void this.router.navigateByUrl('/tabs/home');
        },
        error: (err) => {
          this.addTaskError = err.error?.message || 'E-mail ou senha inválidos.';
        }
      });
    }
  }

  fieldError(controlName: AuthControlName): string {
    const control = this.authForm.controls[controlName];

    if (!control.invalid || (!control.touched && !this.submitAttempted)) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Campo obrigatorio.';
    }

    if (control.hasError('email')) {
      return 'Informe um e-mail valido.';
    }

    if (control.hasError('minlength')) {
      return controlName === 'password' ? 'Use pelo menos 6 caracteres.' : 'Use pelo menos 3 caracteres.';
    }

    if (control.hasError('maxlength')) {
      return controlName === 'email' ? 'Use no maximo 254 caracteres.' : 'Use um texto mais curto.';
    }

    if (control.hasError('pattern')) {
      return 'Use apenas letras, espacos, apostrofo ou hifen.';
    }

    if (control.hasError('strongPassword')) {
      return 'A senha deve ter 10+ caracteres, com maiúscula, minúscula, número e símbolo.';
    }

    return 'Revise este campo.';
  }

  hasFieldError(controlName: AuthControlName): boolean {
    return this.fieldError(controlName).length > 0;
  }
}
