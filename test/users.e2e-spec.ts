import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  cleanupUserByEmail,
  cleanupUserById,
  createPrismaClient,
  createTestApp,
  createUser,
  login,
  uniqueEmail,
} from './e2e-utils';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let email: string;
  let token: string;
  let userId: string;
  const prisma = createPrismaClient();

  beforeAll(async () => {
    app = await createTestApp();
    email = uniqueEmail('users');

    const user = await createUser(prisma, {
      email,
      password: 'Password123!',
      firstName: 'Users',
      lastName: 'Tester',
    });
    userId = user.id;
    token = await login(app, email, 'Password123!');
  });

  afterAll(async () => {
    await cleanupUserById(prisma, userId);
    await prisma.$disconnect();
    await app.close();
  });

  it('GET /users/me (unauthorized)', async () => {
    await request(app.getHttpServer()).get('/users/me').expect(401);
  });

  it('GET /users (unauthorized)', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
  });

  it('GET /users/me (authorized)', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: userId,
      email,
      firstName: 'Users',
      lastName: 'Tester',
    });
  });

  it('GET /users (authorized)', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((user: any) => user.email === email)).toBe(true);
  });

  it('POST /users (authorized)', async () => {
    const newEmail = uniqueEmail('users-create');

    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: newEmail,
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      email: newEmail,
      firstName: 'New',
      lastName: 'User',
    });
    expect(response.body.password).toBeUndefined();

    await cleanupUserByEmail(newEmail);
  });
});
