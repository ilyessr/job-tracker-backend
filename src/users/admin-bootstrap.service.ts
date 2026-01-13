import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    const firstName =
      this.configService.get<string>('ADMIN_FIRST_NAME') || 'Admin';
    const lastName =
      this.configService.get<string>('ADMIN_LAST_NAME') || 'User';

    if (!email || !password) {
      return;
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing) {
      if (existing.role !== Role.ADMIN) {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: { role: Role.ADMIN },
        });
        this.logger.log(`Promoted ${email} to ADMIN.`);
      }
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
        firstName,
        lastName,
        role: Role.ADMIN,
      },
    });

    this.logger.log(`Created bootstrap admin ${email}.`);
  }
}
