import { NextResponse } from 'next/server';

type ErrorDetails = Record<string, unknown> | string | undefined;

export class ApiError extends Error {
  status: number;
  details?: ErrorDetails;

  constructor(status: number, message: string, details?: ErrorDetails) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function jsonResponse<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function errorResponse(status: number, message: string, details?: ErrorDetails) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        details
      }
    },
    { status }
  );
}

export function handleRouteError(error: unknown) {
  if (error instanceof ApiError) {
    return errorResponse(error.status, error.message, error.details);
  }

  if (error && typeof error === 'object' && 'status' in error && typeof (error as any).status === 'number') {
    const status = (error as any).status as number;
    const message = (error as any).message || 'Request failed';
    return errorResponse(status, message);
  }

  console.error('[API_ERROR]', error);
  return errorResponse(500, 'Unexpected server error');
}
