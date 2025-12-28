import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';

@Injectable()
export class JobApplicationsService {
  constructor(private prisma: PrismaService) {}

  private toResponseDto(application: any) {
    return {
      id: application.id,
      company: application.company,
      jobTitle: application.jobTitle,
      link: application.link,
      applicationDate: application.applicationDate,
      status: application.status,
      createdAt: application.createdAt,
    };
  }

  async create(userId: string, dto: CreateJobApplicationDto) {
    const applicationDate = new Date(dto.applicationDate);
    if (isNaN(applicationDate.getTime())) {
      throw new BadRequestException('Invalid application date');
    }

    const app = await this.prisma.jobApplication.create({
      data: {
        company: dto.company,
        jobTitle: dto.jobTitle,
        link: dto.link,
        applicationDate,
        status: dto.status,
        userId,
      },
    });

    return this.toResponseDto(app);
  }
  async findOneForUser(id: string, userId: string) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Job application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('Not allowed');
    }

    return this.toResponseDto(application);
  }

  async findAllForUser(userId: string) {
    const apps = await this.prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { applicationDate: 'desc' },
    });

    return apps.map((app) => this.toResponseDto(app));
  }

  async update(id: string, userId: string, dto: UpdateJobApplicationDto) {
    const existing = await this.prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Job application not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Not allowed');
    }

    const updateData: any = {};

    if (dto.company !== undefined) updateData.company = dto.company;
    if (dto.jobTitle !== undefined) updateData.jobTitle = dto.jobTitle;
    if (dto.link !== undefined) updateData.link = dto.link;
    if (dto.status !== undefined) updateData.status = dto.status;

    if (dto.applicationDate !== undefined) {
      const parsed = new Date(dto.applicationDate);
      if (isNaN(parsed.getTime())) {
        throw new BadRequestException('Invalid application date');
      }
      updateData.applicationDate = parsed;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields provided to update');
    }

    const app = await this.prisma.jobApplication.update({
      where: { id },
      data: updateData,
    });

    return this.toResponseDto(app);
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Job application not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Not allowed');
    }

    await this.prisma.jobApplication.delete({ where: { id } });

    return { success: true };
  }
}
