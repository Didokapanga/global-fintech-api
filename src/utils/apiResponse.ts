export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export function successResponse<T>(
  message: string,
  data?: T
): ApiResponse<T> {
  return {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
}

export function errorResponse(
  message: string,
  error?: any
): ApiResponse {
  return {
    success: false,
    message,
    ...(error !== undefined && { error }),
  };
}

