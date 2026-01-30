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
  Res,
} from '@nestjs/common';
import { User } from '../auth/user.decorator';
import { JobApplicationsService } from './job-applications.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JobApplicationsQueryDto } from './dto/job-applications-query.dto';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

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
      query.from,
      query.to,
    );
  }

  @Get('export/pdf')
  async exportPdf(
    @User('userId') userId: string,
    @Query() query: JobApplicationsQueryDto,
    @Res() res: Response,
  ) {
    const apps = await this.jobApplicationsService.findAllForUserExport(
      userId,
      query.status,
      query.from,
      query.to,
    );

    const filename = `job-applications-${this.formatDate(
      new Date(),
    )}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(18).text('Job Applications Export', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555').text(
      `Generated at ${new Date().toISOString()}`,
    );
    doc.moveDown(1);

    if (query.from || query.to) {
      const range = `${query.from ?? '...'} → ${query.to ?? '...'}`;
      doc.fillColor('#000').fontSize(12).text(`Period: ${range}`);
      doc.moveDown(0.5);
    }

    if (query.status) {
      doc.fontSize(12).text(`Status: ${query.status}`);
      doc.moveDown(0.5);
    }

    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total: ${apps.length}`);
    doc.moveDown(1);

    doc.fontSize(10).fillColor('#000');
    for (const app of apps) {
      doc
        .fontSize(11)
        .text(`${app.company} — ${app.jobTitle}`, { continued: false });
      doc
        .fontSize(9)
        .fillColor('#555')
        .text(
          `Applied: ${this.formatDate(app.applicationDate)} | Status: ${
            app.status
          } | Had interview: ${app.hadInterview ? 'yes' : 'no'}`,
        );
      if (app.link) {
        doc.text(`Link: ${app.link}`);
      }
      doc.moveDown(0.75).fillColor('#000');
    }

    doc.end();
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

  private formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }
}
