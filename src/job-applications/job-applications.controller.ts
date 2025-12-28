import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { User } from '../auth/user.decorator';
import { JobApplicationsService } from './job-applications.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';

@Controller('job-applications')
@UseGuards(JwtAuthGuard)
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Post()
  create(@User('userId') userId: string, @Body() dto: CreateJobApplicationDto) {
    return this.jobApplicationsService.create(userId, dto);
  }

  @Get()
  findAll(@User('userId') userId: string) {
    return this.jobApplicationsService.findAllForUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @User('userId') userId: string) {
    return this.jobApplicationsService.findOneForUser(id, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @User('userId') userId: string,
    @Body() dto: UpdateJobApplicationDto,
  ) {
    return this.jobApplicationsService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User('userId') userId: string) {
    return this.jobApplicationsService.remove(id, userId);
  }
}
