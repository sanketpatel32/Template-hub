export type RequestContext = {
  requestId?: string;
  traceId?: string;
  spanId?: string;
  requestStartTime?: bigint;
  metricsStartTimeNs?: bigint;
};
