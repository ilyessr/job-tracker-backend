import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  cleanupUserByEmail,
  createPrismaClient,
  createTestApp,
  createUser,
  login,
  uniqueEmail,
} from './e2e-utils';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let email: string;
  const password = 'Password123!';
  const prisma = createPrismaClient();

  beforeAll(async () => {
    app = await createTestApp();
    email = uniqueEmail('auth');

    await createUser(prisma, {
      email,
      password,
      firstName: 'Auth',
      lastName: 'Tester',
    });
  });

  afterAll(async () => {
    await cleanupUserByEmail(email);
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /auth/login (valid credentials)', async () => {
    const token = await login(app, email, password);
    expect(typeof token).toBe('string');
  });

  it('POST /auth/login (invalid credentials)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);
  });
});
