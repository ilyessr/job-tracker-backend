import { Module } from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';

@Module({
  providers: [JobApplicationsService]
})
export class JobApplicationsModule {}
