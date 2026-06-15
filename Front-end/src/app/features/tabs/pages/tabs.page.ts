import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import type { EmergencyContact } from '../../../core/models';
import { EmergencyService } from '../../../core/services';
import { BottomNavigationComponent } from '../../../shared/components/bottom-navigation/bottom-navigation.component';
import { trackById } from '../../../shared/utils';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [BottomNavigationComponent, CommonModule, RouterOutlet],
  templateUrl: './tabs.page.html',
})
export class TabsPage {
  private readonly emergencyService = inject(EmergencyService);

  emergencyOpen = false;
  emergencyLoading = false;
  emergencyContacts: readonly EmergencyContact[] = this.emergencyService.getEmergencyContacts();
  readonly trackByEmergencyContactId = trackById<EmergencyContact>;

  openEmergencyContacts(): void {
    this.emergencyOpen = true;
    this.emergencyLoading = true;

    this.emergencyService.loadEmergencyContacts().subscribe({
      next: (contacts) => {
        this.emergencyContacts = contacts;
        this.emergencyLoading = false;
      },
      error: () => {
        this.emergencyContacts = this.emergencyService.getEmergencyContacts();
        this.emergencyLoading = false;
      }
    });
  }

  closeEmergencyContacts(): void {
    this.emergencyOpen = false;
  }
}
