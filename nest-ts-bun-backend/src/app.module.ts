import { Module } from '@nestjs/common';
import { HealthController } from './routes/health.route';
import { MetricsController } from './routes/metrics.route';
import { PingController } from './routes/ping.route';

@Module({
  controllers: [HealthController, MetricsController, PingController],
})
export class AppModule {}
