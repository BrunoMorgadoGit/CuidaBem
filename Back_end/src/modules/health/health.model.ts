export type ObservationCategory = 'pele' | 'excreção' | 'comportamento' | 'vital';

export type AnalysisRiskLevel = 'low' | 'medium' | 'high';

export interface VitalSignsData {
  systolicPressure?: number;
  diastolicPressure?: number;
  temperature?: number;
  bloodGlucose?: number;
  oxygenSaturation?: number;
  heartRate?: number;
  respiratoryRate?: number;
}

export interface SkinObservationData {
  notes: string;
  location?: string;
  imageFileReference?: string;
  imageBase64?: string;
}

export interface ExcretionObservationData {
  notes: string;
  frequency?: number;
  color?: string;
  consistency?: string;
  imageBase64?: string;
}

export interface BehaviorObservationData {
  notes: string;
  agitationLevel?: number;
  hasConfusion?: boolean;
  refusedFood?: boolean;
}

export type ObservationInputData =
  | VitalSignsData
  | SkinObservationData
  | ExcretionObservationData
  | BehaviorObservationData;

export interface AnalysisResult {
  detectedRisk: AnalysisRiskLevel;
  diagnosticFindings: string[];
  clinicalRecommendations: string[];
  requiresImmediateAttention: boolean;
}

export interface ObservationRecord {
  id: string;
  patientId: string;
  category: ObservationCategory;
  inputData: ObservationInputData;
  recordedAt: string;
  analysisResult: AnalysisResult;
}
