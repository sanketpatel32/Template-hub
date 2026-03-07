import { randomUUID } from "node:crypto";
import { env } from "../config/env";

export type TraceContext = {
  traceId: string;
  spanId: string;
  requestStartTime: number;
};

export function startRequestTrace(incomingTraceId?: string): TraceContext {
  return {
    traceId: incomingTraceId || randomUUID(),
    spanId: randomUUID().replaceAll("-", "").slice(0, 16),
    requestStartTime: Date.now(),
  };
}

export function emitRequestTraceSpan(input: {
  requestId?: string;
  traceId?: string;
  spanId?: string;
  method: string;
  path: string;
  statusCode: number;
  requestStartTime?: number;
}): void {
  if (!env.TRACE_ENABLED) {
    return;
  }

  const durationMs = input.requestStartTime ? Date.now() - input.requestStartTime : undefined;

  const span = {
    traceId: input.traceId,
    spanId: input.spanId,
    requestId: input.requestId,
    name: `http.${input.method.toLowerCase()}`,
    attributes: {
      "http.method": input.method,
      "http.path": input.path,
      "http.status_code": input.statusCode,
    },
    durationMs,
    timestamp: new Date().toISOString(),
  };

  console.info(JSON.stringify({ type: "trace-span", span }));
}
