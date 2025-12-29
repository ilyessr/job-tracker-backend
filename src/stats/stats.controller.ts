import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/user.decorator';

@Controller('stats')
@UseGuards(AuthGuard('jwt'))
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getStats(@User('userId') userId: string) {
    return this.statsService.getStatsForUser(userId);
  }
}
