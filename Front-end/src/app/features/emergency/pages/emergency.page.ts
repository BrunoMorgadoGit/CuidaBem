import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { SupportContact } from '../../../core/models';
import { EmergencyService, PatientService } from '../../../core/services';
import { BottomNavigationComponent } from '../../../shared/components';
import { trackById } from '../../../shared/utils';

@Component({
  selector: 'app-emergency',
  standalone: true,
  imports: [BottomNavigationComponent, CommonModule, RouterLink],
  templateUrl: './emergency.page.html',
  styleUrls: ['./emergency.page.css'],
})
export class EmergencyPage implements OnInit {
  private readonly patientService = inject(PatientService);
  private readonly emergencyService = inject(EmergencyService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly patient = this.patientService.getCurrentPatient();
  contacts: SupportContact[] = [];
  readonly trackByContactId = trackById<SupportContact>;

  ngOnInit(): void {
    const patientId = this.patient.id;
    this.emergencyService.loadSupportContacts(patientId).subscribe({
      next: (contacts) => {
        this.contacts = contacts;
      },
      error: (err) => {
        console.error('Error loading support contacts:', err);
      }
    });
  }
}
