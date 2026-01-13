import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminBootstrapService } from './admin-bootstrap.service';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, AdminBootstrapService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
