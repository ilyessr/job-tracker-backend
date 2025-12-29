import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

export function createPrismaClient() {
  return new PrismaClient();
}

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}

export function uniqueEmail(tag: string) {
  const timestamp = Date.now();
  return `e2e-${tag}-${timestamp}@example.com`;
}

export async function createUser(
  prisma: PrismaClient,
  params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
},
) {
  await prisma.user.deleteMany({ where: { email: params.email } });

  const passwordHash = await bcrypt.hash(params.password, 10);
  return prisma.user.create({
    data: {
      email: params.email,
      password: passwordHash,
      firstName: params.firstName,
      lastName: params.lastName,
    },
  });
}

export async function login(
  app: INestApplication,
  email: string,
  password: string,
) {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  return response.body.access_token as string;
}

export async function cleanupUserByEmail(email: string) {
  const prisma = createPrismaClient();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await prisma.$disconnect();
    return;
  }

  await prisma.jobApplication.deleteMany({ where: { userId: user.id } });
  await prisma.user.deleteMany({ where: { id: user.id } });
  await prisma.$disconnect();
}

export async function cleanupUserById(prisma: PrismaClient, userId: string) {
  await prisma.jobApplication.deleteMany({ where: { userId } });
  await prisma.user.deleteMany({ where: { id: userId } });
}
