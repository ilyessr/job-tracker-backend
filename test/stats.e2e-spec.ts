import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApplicationStatus } from '@prisma/client';
import {
  cleanupUserById,
  createPrismaClient,
  createTestApp,
  createUser,
  login,
  uniqueEmail,
} from './e2e-utils';

describe('StatsController (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let token: string;
  const prisma = createPrismaClient();

  beforeAll(async () => {
    app = await createTestApp();

    const user = await createUser(prisma, {
      email: uniqueEmail('stats'),
      password: 'Password123!',
      firstName: 'Stats',
      lastName: 'Tester',
    });
    userId = user.id;
    token = await login(app, user.email, 'Password123!');

    const now = new Date();
    const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 5);
    const previousMonthDate = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      10,
    );

    await prisma.jobApplication.createMany({
      data: [
        {
          company: 'Stats Co 1',
          jobTitle: 'Engineer',
          link: 'https://example.com',
          applicationDate: currentMonthDate,
          status: ApplicationStatus.APPLIED,
          userId,
        },
        {
          company: 'Stats Co 2',
          jobTitle: 'Engineer',
          link: 'https://example.com',
          applicationDate: currentMonthDate,
          status: ApplicationStatus.INTERVIEW,
          userId,
        },
        {
          company: 'Stats Co 3',
          jobTitle: 'Engineer',
          link: 'https://example.com',
          applicationDate: previousMonthDate,
          status: ApplicationStatus.REJECTED,
          userId,
        },
      ],
    });
  });

  afterAll(async () => {
    await cleanupUserById(prisma, userId);
    await prisma.$disconnect();
    await app.close();
  });

  it('GET /stats (unauthorized)', async () => {
    await request(app.getHttpServer()).get('/stats').expect(401);
  });

  it('GET /stats', async () => {
    const response = await request(app.getHttpServer())
      .get('/stats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.byStatus).toEqual({
      APPLIED: 1,
      INTERVIEW: 1,
      REJECTED: 1,
      ACCEPTED: 0,
    });

    const byMonth = [...response.body.byMonth].sort((a: any, b: any) =>
      a.month.localeCompare(b.month),
    );
    const interviewByMonth = [...response.body.interviewByMonth].sort(
      (a: any, b: any) => a.month.localeCompare(b.month),
    );

    expect(byMonth.length).toBe(2);
    expect(byMonth[0]).toHaveProperty('month');
    expect(byMonth[0]).toHaveProperty('count');
    expect(response.body.averagePerMonth).toBe(1.5);
    expect(response.body.interviewTotal).toBe(1);
    expect(response.body.interviewRate).toBe(33.33);
    expect(interviewByMonth.length).toBe(2);
    expect(interviewByMonth[0]).toHaveProperty('month');
    expect(interviewByMonth[0]).toHaveProperty('count');
  });
});
