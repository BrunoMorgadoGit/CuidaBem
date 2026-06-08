import { ObservationCategory, ObservationInputData, AnalysisResult, ObservationRecord } from './health.model';

export interface CreateObservationRequestDto {
  patientId: string;
  category: ObservationCategory;
  inputData: ObservationInputData;
}

export interface AnalyzeObservationResponseDto {
  category: ObservationCategory;
  analysisResult: AnalysisResult;
  isPersisted: false;
}

export type SaveObservationResponseDto = ObservationRecord;
