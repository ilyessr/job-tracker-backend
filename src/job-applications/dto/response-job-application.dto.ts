import { ApplicationStatus } from '@prisma/client';

export class JobApplicationResponseDto {
  id: string;
  company: string;
  jobTitle: string;
  link: string;
  applicationDate: Date;
  status: ApplicationStatus;
  createdAt: Date;
}
