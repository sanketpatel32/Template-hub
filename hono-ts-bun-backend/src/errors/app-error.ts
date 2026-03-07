import type { ProblemDetails } from "../types/api";

const ERROR_BASE_URI = "https://api.example.dev/errors";

export type AppErrorOptions = {
  status: number;
  code: string;
  title: string;
  detail: string;
  type?: string;
  isOperational?: boolean;
  errors?: unknown[];
  meta?: Record<string, unknown>;
  cause?: unknown;
};

export class AppError extends Error {
  status: number;
  code: string;
  title: string;
  detail: string;
  type: string;
  isOperational: boolean;
  errors: unknown[];
  meta: Record<string, unknown>;

  constructor(options: AppErrorOptions) {
    super(options.detail, options.cause ? { cause: options.cause } : undefined);
    this.name = "AppError";
    this.status = options.status;
    this.code = options.code;
    this.title = options.title;
    this.detail = options.detail;
    this.type =
      options.type ?? `${ERROR_BASE_URI}/${options.code.toLowerCase().replaceAll("_", "-")}`;
    this.isOperational = options.isOperational ?? options.status < 500;
    this.errors = options.errors ?? [];
    this.meta = options.meta ?? {};
  }
}

export function toProblemDetails(
  error: AppError,
  context: {
    instance: string;
    requestId?: string;
    traceId?: string;
  },
): ProblemDetails {
  return {
    type: error.type,
    title: error.title,
    status: error.status,
    detail: error.detail,
    instance: context.instance,
    code: error.code,
    requestId: context.requestId,
    traceId: context.traceId,
    errors: error.errors,
  };
}
