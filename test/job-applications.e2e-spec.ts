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

describe('JobApplicationsController (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let token: string;
  let otherUserId: string;
  let otherToken: string;
  const prisma = createPrismaClient();

  beforeAll(async () => {
    app = await createTestApp();

    const user = await createUser(prisma, {
      email: uniqueEmail('jobs'),
      password: 'Password123!',
      firstName: 'Jobs',
      lastName: 'Tester',
    });
    userId = user.id;
    token = await login(app, user.email, 'Password123!');

    const otherUser = await createUser(prisma, {
      email: uniqueEmail('jobs-other'),
      password: 'Password123!',
      firstName: 'Other',
      lastName: 'User',
    });
    otherUserId = otherUser.id;
    otherToken = await login(app, otherUser.email, 'Password123!');
  });

  afterAll(async () => {
    await cleanupUserById(prisma, userId);
    await cleanupUserById(prisma, otherUserId);
    await prisma.$disconnect();
    await app.close();
  });

  it('GET /job-applications (unauthorized)', async () => {
    await request(app.getHttpServer()).get('/job-applications').expect(401);
  });

  it('POST /job-applications (creates and validates)', async () => {
    const payload = {
      company: 'Acme',
      jobTitle: 'Engineer',
      link: 'https://example.com',
      applicationDate: new Date().toISOString(),
      status: ApplicationStatus.APPLIED,
    };

    const response = await request(app.getHttpServer())
      .post('/job-applications')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);

    expect(response.body).toMatchObject({
      company: payload.company,
      jobTitle: payload.jobTitle,
      link: payload.link,
      status: payload.status,
    });
  });

  it('POST /job-applications (invalid date)', async () => {
    await request(app.getHttpServer())
      .post('/job-applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: 'Bad Date',
        jobTitle: 'Engineer',
        link: 'https://example.com',
        applicationDate: 'not-a-date',
        status: ApplicationStatus.APPLIED,
      })
      .expect(400);
  });

  it('GET /job-applications (list)', async () => {
    const payload = {
      company: 'List Co',
      jobTitle: 'Developer',
      link: 'https://example.com',
      applicationDate: new Date().toISOString(),
      status: ApplicationStatus.INTERVIEW,
    };

    await request(app.getHttpServer())
      .post('/job-applications')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/job-applications')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /job-applications/:id (authorized)', async () => {
    const created = await request(app.getHttpServer())
      .post('/job-applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: 'Single Co',
        jobTitle: 'Developer',
        link: 'https://example.com',
        applicationDate: new Date().toISOString(),
        status: ApplicationStatus.APPLIED,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/job-applications/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.id).toBe(created.body.id);
  });

  it('GET /job-applications/:id (forbidden)', async () => {
    const created = await request(app.getHttpServer())
      .post('/job-applications')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        company: 'Other Co',
        jobTitle: 'Engineer',
        link: 'https://example.com',
        applicationDate: new Date().toISOString(),
        status: ApplicationStatus.APPLIED,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/job-applications/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('PUT /job-applications/:id (update)', async () => {
    const created = await request(app.getHttpServer())
      .post('/job-applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: 'Update Co',
        jobTitle: 'Engineer',
        link: 'https://example.com',
        applicationDate: new Date().toISOString(),
        status: ApplicationStatus.APPLIED,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .put(`/job-applications/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: ApplicationStatus.ACCEPTED })
      .expect(200);

    expect(response.body.status).toBe(ApplicationStatus.ACCEPTED);
  });

  it('PUT /job-applications/:id (no fields)', async () => {
    const created = await request(app.getHttpServer())
      .post('/job-applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: 'No Fields',
        jobTitle: 'Engineer',
        link: 'https://example.com',
        applicationDate: new Date().toISOString(),
        status: ApplicationStatus.APPLIED,
      })
      .expect(201);

    await request(app.getHttpServer())
      .put(`/job-applications/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);
  });

  it('DELETE /job-applications/:id (remove)', async () => {
    const created = await request(app.getHttpServer())
      .post('/job-applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: 'Delete Co',
        jobTitle: 'Engineer',
        link: 'https://example.com',
        applicationDate: new Date().toISOString(),
        status: ApplicationStatus.APPLIED,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .delete(`/job-applications/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({ success: true });
  });
});
