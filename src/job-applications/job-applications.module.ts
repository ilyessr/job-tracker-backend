import { Module } from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { JobApplicationsController } from './job-applications.controller';

@Module({
  providers: [JobApplicationsService],
  controllers: [JobApplicationsController]
})
export class JobApplicationsModule {}
