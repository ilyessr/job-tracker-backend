import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateJobApplicationInput = {
  company: string;
  jobTitle: string;
  link: string;
  applicationDate: string;
  status: 'APPLIED' | 'INTERVIEW' | 'REJECTED' | 'ACCEPTED';
};

@Injectable()
export class JobApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateJobApplicationInput) {
    const applicationDate = new Date(data.applicationDate);

    if (isNaN(applicationDate.getTime())) {
      throw new Error('Invalid application date');
    }

    return this.prisma.jobApplication.create({
      data: {
        company: data.company,
        jobTitle: data.jobTitle,
        link: data.link,
        applicationDate,
        status: data.status,
        userId: userId,
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.jobApplication.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        applicationDate: 'desc',
      },
    });
  }

  async remove(applicationId: string, userId: string) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Job application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this job application',
      );
    }

    await this.prisma.jobApplication.delete({
      where: { id: applicationId },
    });

    return { success: true };
  }
}
