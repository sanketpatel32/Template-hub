import { randomBytes } from 'node:crypto';
import { env } from '../config/env';

export type TraceContext = {
  traceId: string;
  spanId: string;
  requestStartTime: bigint;
};

function createHexId(bytes: number): string {
  return randomBytes(bytes).toString('hex');
}

export function startRequestTrace(traceIdFromHeader?: string): TraceContext {
  const traceId = traceIdFromHeader?.trim() || createHexId(16);
  const spanId = createHexId(8);

  return {
    traceId,
    spanId,
    requestStartTime: process.hrtime.bigint(),
  };
}

export function emitRequestTraceSpan(args: {
  requestId?: string;
  traceId?: string;
  spanId?: string;
  method: string;
  path: string;
  statusCode: number;
  requestStartTime?: bigint;
}): void {
  if (!env.TRACE_ENABLED || !args.requestStartTime) {
    return;
  }

  const elapsedNs = process.hrtime.bigint() - args.requestStartTime;
  const durationMs = Number(elapsedNs) / 1_000_000;

  // Console export is intentionally used for this lightweight tracing scaffold.
  console.log(
    JSON.stringify({
      trace: {
        exporter: 'console',
        requestId: args.requestId,
        traceId: args.traceId,
        spanId: args.spanId,
        method: args.method,
        path: args.path,
        statusCode: args.statusCode,
        durationMs: Number(durationMs.toFixed(3)),
        timestamp: new Date().toISOString(),
      },
    }),
  );
}
