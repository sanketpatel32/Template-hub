import { Controller, Get } from '@nestjs/common';
import { env } from '../config/env';
import { ServiceUnavailableError } from '../errors/http-errors';
import { isServiceReady } from '../state/readiness';
import type { SuccessResponse } from '../types/api';

@Controller()
export class HealthController {
  @Get('health')
  getHealth(): SuccessResponse<{
    status: string;
    uptime: number;
    timestamp: string;
    environment: string;
  }> {
    return {
      success: true,
      data: {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
      },
    };
  }

  @Get('ready')
  getReady(): SuccessResponse<{ ready: boolean; timestamp: string }> {
    if (!isServiceReady()) {
      throw new ServiceUnavailableError({
        detail: 'Service is shutting down and not ready to serve traffic.',
      });
    }

    return {
      success: true,
      data: {
        ready: true,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
