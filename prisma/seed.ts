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
      hadInterview: false,
      monthsAgo: 1,
    },
    {
      company: 'Amazon',
      jobTitle: 'Backend Developer',
      status: ApplicationStatus.INTERVIEW,
      hadInterview: true,
      monthsAgo: 2,
    },
    {
      company: 'Spotify',
      jobTitle: 'Fullstack Developer',
      status: ApplicationStatus.REJECTED,
      hadInterview: true,
      monthsAgo: 3,
    },
    {
      company: 'Netflix',
      jobTitle: 'Software Engineer',
      status: ApplicationStatus.ACCEPTED,
      hadInterview: true,
      monthsAgo: 4,
    },
    {
      company: 'Airbnb',
      jobTitle: 'Product Designer',
      status: ApplicationStatus.APPLIED,
      hadInterview: false,
      monthsAgo: 1,
    },
    {
      company: 'Stripe',
      jobTitle: 'Backend Engineer',
      status: ApplicationStatus.INTERVIEW,
      hadInterview: true,
      monthsAgo: 1,
    },
    {
      company: 'Figma',
      jobTitle: 'Design Engineer',
      status: ApplicationStatus.REJECTED,
      hadInterview: false,
      monthsAgo: 2,
    },
    {
      company: 'Meta',
      jobTitle: 'Data Scientist',
      status: ApplicationStatus.APPLIED,
      hadInterview: false,
      monthsAgo: 2,
    },
    {
      company: 'Apple',
      jobTitle: 'iOS Developer',
      status: ApplicationStatus.INTERVIEW,
      hadInterview: true,
      monthsAgo: 3,
    },
    {
      company: 'Microsoft',
      jobTitle: 'Cloud Engineer',
      status: ApplicationStatus.ACCEPTED,
      hadInterview: true,
      monthsAgo: 5,
    },
    {
      company: 'Tesla',
      jobTitle: 'Fullstack Developer',
      status: ApplicationStatus.REJECTED,
      hadInterview: true,
      monthsAgo: 6,
    },
    {
      company: 'Shopify',
      jobTitle: 'Frontend Engineer',
      status: ApplicationStatus.APPLIED,
      hadInterview: false,
      monthsAgo: 4,
    },
    {
      company: 'Notion',
      jobTitle: 'Mobile Engineer',
      status: ApplicationStatus.INTERVIEW,
      hadInterview: true,
      monthsAgo: 5,
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
          hadInterview: app.hadInterview,
          userId: user.id,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
