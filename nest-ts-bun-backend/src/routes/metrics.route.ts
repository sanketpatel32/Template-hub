import { Controller, Get, Header } from '@nestjs/common';
import { env } from '../config/env';
import { NotFoundError } from '../errors/http-errors';
import { getMetricsSnapshot, metricsRegistry } from '../observability/metrics';

@Controller('metrics')
export class MetricsController {
  @Get()
  @Header('Content-Type', metricsRegistry.contentType)
  async getMetrics(): Promise<string> {
    if (!env.METRICS_ENABLED) {
      throw new NotFoundError({
        detail: 'Metrics endpoint is disabled.',
      });
    }

    return getMetricsSnapshot();
  }
}
