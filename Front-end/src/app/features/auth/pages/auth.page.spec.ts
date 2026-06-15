import { ChangeDetectorRef, Injector, runInInjectionContext } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { AuthPage } from './auth.page';
import { UserService, PatientService, AuthSessionService } from '../../../core/services';

const routeWithMode = (mode?: string): ActivatedRoute => ({
  snapshot: {
    data: mode ? { mode } : {}
  }
} as ActivatedRoute);

function createPage(mode?: string): AuthPage {
  const injector = Injector.create({
    providers: [
      {
        provide: ActivatedRoute,
        useValue: routeWithMode(mode)
      },
      {
        provide: Router,
        useValue: {
          navigateByUrl: () => Promise.resolve(true)
        }
      },
      {
        provide: UserService,
        useValue: {}
      },
      {
        provide: PatientService,
        useValue: {}
      },
      {
        provide: AuthSessionService,
        useValue: {}
      },
      {
        provide: ChangeDetectorRef,
        useValue: {
          markForCheck: () => {}
        }
      }
    ]
  });

  return runInInjectionContext(injector, () => new AuthPage());
}

describe('AuthPage', () => {
  it('uses login mode by default', () => {
    const page = createPage();

    expect(page.mode).toBe('login');
    expect(page.isRegister).toBe(false);
  });

  it('uses register mode when route data asks for it', () => {
    const page = createPage('register');

    expect(page.mode).toBe('register');
    expect(page.isRegister).toBe(true);
  });

  it('requires strong passwords when registering', () => {
    const page = createPage('register');

    page.authForm.controls.name.setValue('Cuidador Exemplo');
    page.authForm.controls.elderlyName.setValue('Idoso Exemplo');
    page.authForm.controls.email.setValue('cuidador@cuidabem.test');
    page.authForm.controls.password.setValue('123456');
    page.continue();

    expect(page.authForm.controls.password.hasError('strongPassword')).toBe(true);
    expect(page.fieldError('password')).toContain('10+ caracteres');

    page.authForm.controls.password.setValue('SenhaForte#2026');
    expect(page.authForm.valid).toBe(true);
  });

  it('falls back to login for unknown route modes', () => {
    const page = createPage('forgot-password');

    expect(page.mode).toBe('login');
    expect(page.isRegister).toBe(false);
  });
});
