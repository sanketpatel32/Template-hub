import { Controller, Get } from '@nestjs/common';
import type { SuccessResponse } from '../types/api';

@Controller('api/v1')
export class PingController {
  @Get('ping')
  ping(): SuccessResponse<{ message: string; version: string }> {
    return {
      success: true,
      data: {
        message: 'pong',
        version: 'v1',
      },
    };
  }
}
