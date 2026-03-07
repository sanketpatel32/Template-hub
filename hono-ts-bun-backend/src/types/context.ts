import type { ContextVariableMap } from "hono";

export type RequestContext = {
  requestId: string;
  traceId: string;
  spanId: string;
  requestStartTime: number;
  metricsStartTimeNs?: bigint;
};

export type AppVariables = ContextVariableMap & {
  requestContext: RequestContext;
};
