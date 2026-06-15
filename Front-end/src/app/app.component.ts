import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthSessionService, UserService, PatientService } from './core/services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly authSession = inject(AuthSessionService);
  private readonly userService = inject(UserService);
  private readonly patientService = inject(PatientService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.authSession.estaAutenticado()) {
      this.authSession.loadMe().subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.userService.setCurrentUser(res.data.user);
            if (res.data.currentPatient) {
              this.patientService.setCurrentPatient(res.data.currentPatient);
            }
          }
        },
        error: () => {
          this.authSession.clearSession();
          void this.router.navigateByUrl('/login');
        }
      });
    }
  }
}
