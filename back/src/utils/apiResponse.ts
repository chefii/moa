import { Response } from 'express';

/**
 * API 응답 표준 포맷 유틸리티
 * 모든 API 응답을 일관된 형태로 반환
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  code?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 성공 응답 생성
 */
export function success<T>(data: T, message?: string): ApiSuccessResponse<T> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return response;
}

/**
 * 에러 응답 생성
 */
export function error(message: string, errorDetail?: string, code?: string): ApiErrorResponse {
  const response: ApiErrorResponse = {
    success: false,
    message,
  };

  if (errorDetail) {
    response.error = errorDetail;
  }

  if (code) {
    response.code = code;
  }

  return response;
}

/**
 * Express Response 객체에 성공 응답 전송
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  return res.status(statusCode).json(success(data, message));
}

/**
 * Express Response 객체에 에러 응답 전송
 */
export function sendError(
  res: Response,
  message: string,
  errorDetail?: string,
  statusCode: number = 500,
  code?: string
): Response {
  return res.status(statusCode).json(error(message, errorDetail, code));
}

/**
 * 생성(Created) 응답 전송
 */
export function sendCreated<T>(res: Response, data: T, message?: string): Response {
  return sendSuccess(res, data, message, 201);
}

/**
 * 삭제(No Content) 응답 전송
 */
export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

/**
 * Bad Request (400) 응답 전송
 */
export function sendBadRequest(res: Response, message: string, errorDetail?: string): Response {
  return sendError(res, message, errorDetail, 400, 'BAD_REQUEST');
}

/**
 * Unauthorized (401) 응답 전송
 */
export function sendUnauthorized(res: Response, message: string = 'Unauthorized'): Response {
  return sendError(res, message, undefined, 401, 'UNAUTHORIZED');
}

/**
 * Forbidden (403) 응답 전송
 */
export function sendForbidden(
  res: Response,
  message: string = 'Forbidden - You do not have permission'
): Response {
  return sendError(res, message, undefined, 403, 'FORBIDDEN');
}

/**
 * Not Found (404) 응답 전송
 */
export function sendNotFound(res: Response, message: string = 'Resource not found'): Response {
  return sendError(res, message, undefined, 404, 'NOT_FOUND');
}

/**
 * Conflict (409) 응답 전송
 */
export function sendConflict(res: Response, message: string, errorDetail?: string): Response {
  return sendError(res, message, errorDetail, 409, 'CONFLICT');
}

/**
 * Internal Server Error (500) 응답 전송
 */
export function sendInternalError(
  res: Response,
  message: string = 'Internal server error',
  errorDetail?: string
): Response {
  return sendError(res, message, errorDetail, 500, 'INTERNAL_ERROR');
}
