export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type TaskStatus = 'done' | 'overdue' | 'upcoming' | 'now';

export type RiskLevel = 'baixo' | 'moderado' | 'elevado';

export type PatientActivityStatus = 'active' | 'inactive' | 'monitoring';

export interface Patient {
  id: string;
  name: string;
  age: number;
  healthConditions: string[];
  photoUrl: string;
  activityStatus: PatientActivityStatus;
  admissionDate: string;
}

export interface Task {
  id: string;
  patientId: string;
  title: string;
  subtitle: string;
  iconIdentifier: string;
  iconBackgroundColor: string;
  iconColor: string;
  priority: TaskPriority;
  scheduledTime: string;
  status: TaskStatus;
  relatedGuideId?: string;
}

export interface RiskSnapshot {
  level: RiskLevel;
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
}

export interface PatientDashboard {
  patient: Patient;
  dailyTasks: Task[];
  riskSnapshot: RiskSnapshot;
}
