import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '../auth/user.decorator';
import { JobApplicationsService } from './job-applications.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JobApplicationsQueryDto } from './dto/job-applications-query.dto';

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
  findAll(
    @User('userId') userId: string,
    @Query() query: JobApplicationsQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return this.jobApplicationsService.findAllForUser(
      userId,
      page,
      limit,
      query.status,
    );
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
