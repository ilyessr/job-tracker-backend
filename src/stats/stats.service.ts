import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStatsForUser(userId: string) {
    const byStatusRaw = await this.prisma.jobApplication.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true },
    });

    const byStatus: Record<ApplicationStatus, number> = {
      APPLIED: 0,
      INTERVIEW: 0,
      REJECTED: 0,
      ACCEPTED: 0,
    };

    for (const row of byStatusRaw) {
      byStatus[row.status] = row._count._all;
    }

    const byDateRaw = await this.prisma.jobApplication.groupBy({
      by: ['applicationDate'],
      where: { userId },
      _count: { _all: true },
    });

    const byMonthMap = new Map<string, number>();

    for (const row of byDateRaw) {
      const date = new Date(row.applicationDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;

      byMonthMap.set(
        monthKey,
        (byMonthMap.get(monthKey) || 0) + row._count._all,
      );
    }

    const byMonth = Array.from(byMonthMap.entries()).map(([month, count]) => ({
      month,
      count,
    }));

    const totalApplications = byMonth.reduce(
      (sum, item) => sum + item.count,
      0,
    );

    const averagePerMonth =
      byMonth.length > 0
        ? Number((totalApplications / byMonth.length).toFixed(2))
        : 0;

    return {
      byStatus,
      byMonth,
      averagePerMonth,
    };
  }
}
