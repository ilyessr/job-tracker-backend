import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';
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
      hadInterview: application.hadInterview,
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
        hadInterview: dto.hadInterview,
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

  async findAllForUser(
    userId: string,
    page: number,
    limit: number,
    status?: ApplicationStatus,
    from?: string,
    to?: string,
  ) {
    const skip = (page - 1) * limit;
    const where = this.buildWhere(userId, status, from, to);

    const [apps, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where,
        orderBy: { applicationDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.jobApplication.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      items: apps.map((app) => this.toResponseDto(app)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findAllForUserExport(
    userId: string,
    status?: ApplicationStatus,
    from?: string,
    to?: string,
  ) {
    const where = this.buildWhere(userId, status, from, to);
    return this.prisma.jobApplication.findMany({
      where,
      orderBy: { applicationDate: 'desc' },
    });
  }

  private parseDateOrThrow(value: string, label: string) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ${label} date`);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const utcDate = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
      );
      if (label === 'to') {
        utcDate.setUTCHours(23, 59, 59, 999);
      }
      return utcDate;
    }

    return date;
  }

  private buildWhere(
    userId: string,
    status?: ApplicationStatus,
    from?: string,
    to?: string,
  ) {
    const where: any = { userId };
    if (status) where.status = status;

    if (from || to) {
      const fromDate = from ? this.parseDateOrThrow(from, 'from') : undefined;
      const toDate = to ? this.parseDateOrThrow(to, 'to') : undefined;

      if (fromDate && toDate && fromDate > toDate) {
        throw new BadRequestException('"from" must be before "to"');
      }

      where.applicationDate = {};
      if (fromDate) where.applicationDate.gte = fromDate;
      if (toDate) where.applicationDate.lte = toDate;
    }

    return where;
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
    if (dto.hadInterview !== undefined) updateData.hadInterview = dto.hadInterview;

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
