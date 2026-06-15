export interface ApiResponse<T> {
  success: true;
  data: T;
  message: string;
  meta?: Record<string, any>;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  details?: unknown;
  timestamp: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;
