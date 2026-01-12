import { prisma } from './client';

import { ApplicationStatus } from '@prisma/client';

import * as bcrypt from 'bcrypt';

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@jobtracker.dev' },
    update: {},
    create: {
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@jobtracker.dev',
      password: passwordHash,
    },
  });

  const applications = [
    {
      company: 'Google',
      jobTitle: 'Frontend Developer',
      status: ApplicationStatus.APPLIED,
      monthsAgo: 1,
    },
    {
      company: 'Amazon',
      jobTitle: 'Backend Developer',
      status: ApplicationStatus.INTERVIEW,
      monthsAgo: 2,
    },
    {
      company: 'Spotify',
      jobTitle: 'Fullstack Developer',
      status: ApplicationStatus.REJECTED,
      monthsAgo: 3,
    },
    {
      company: 'Netflix',
      jobTitle: 'Software Engineer',
      status: ApplicationStatus.ACCEPTED,
      monthsAgo: 4,
    },
  ];

  for (const app of applications) {
    const date = new Date();
    date.setMonth(date.getMonth() - app.monthsAgo);

    const exists = await prisma.jobApplication.findFirst({
      where: {
        userId: user.id,
        company: app.company,
        jobTitle: app.jobTitle,
        applicationDate: date,
      },
    });

    if (!exists) {
      await prisma.jobApplication.create({
        data: {
          company: app.company,
          jobTitle: app.jobTitle,
          link: 'https://example.com',
          applicationDate: date,
          status: app.status,
          userId: user.id,
        },
      });
    }
  }

  console.log('✅ Seed done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
