import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { User } from '../auth/user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';

@Controller('job-applications')
@UseGuards(JwtAuthGuard)
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Get()
  async findAll(@User('userId') userId: string) {
    return this.jobApplicationsService.findAllForUser(userId);
  }

  @Post()
  async create(
    @User('userId') userId: string,
    @Body()
    body: {
      company: string;
      jobTitle: string;
      link: string;
      applicationDate: string;
      status: 'APPLIED' | 'INTERVIEW' | 'REJECTED' | 'ACCEPTED';
    },
  ) {
    return this.jobApplicationsService.create(userId, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @User('userId') userId: string) {
    return this.jobApplicationsService.remove(id, userId);
  }
}
