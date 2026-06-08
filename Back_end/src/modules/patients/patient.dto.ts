import { PatientDashboard } from './patient.model';

export type GetDashboardResponseDto = PatientDashboard;

export interface ToggleTaskResponseDto {
  message: string;
  dashboard: PatientDashboard;
}
