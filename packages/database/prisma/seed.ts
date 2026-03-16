import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const hashedPassword = await hash('Demo@123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@taskflow.app' },
    update: {},
    create: {
      email: 'demo@taskflow.app',
      name: 'Demo User',
      password: hashedPassword,
    },
  });

  console.log('Created user:', user.email);

  // Create Inbox project
  const inbox = await prisma.project.upsert({
    where: { id: `${user.id}-inbox` },
    update: {},
    create: {
      id: `${user.id}-inbox`,
      name: 'Inbox',
      color: '#808080',
      isInbox: true,
      order: 0,
      userId: user.id,
    },
  });

  // Create sample projects
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: `${user.id}-work` },
      update: {},
      create: {
        id: `${user.id}-work`,
        name: 'Trabalho',
        color: '#4A90A4',
        order: 1,
        userId: user.id,
      },
    }),
    prisma.project.upsert({
      where: { id: `${user.id}-personal` },
      update: {},
      create: {
        id: `${user.id}-personal`,
        name: 'Pessoal',
        color: '#7ECC49',
        order: 2,
        userId: user.id,
      },
    }),
  ]);

  console.log('Created projects:', [inbox, ...projects].map(p => p.name).join(', '));

  // Create sample labels
  const labels = await Promise.all([
    prisma.label.upsert({
      where: { userId_name: { userId: user.id, name: 'urgente' } },
      update: {},
      create: {
        name: 'urgente',
        color: '#FF6B6B',
        userId: user.id,
      },
    }),
    prisma.label.upsert({
      where: { userId_name: { userId: user.id, name: 'importante' } },
      update: {},
      create: {
        name: 'importante',
        color: '#FFD93D',
        userId: user.id,
      },
    }),
    prisma.label.upsert({
      where: { userId_name: { userId: user.id, name: 'reunião' } },
      update: {},
      create: {
        name: 'reunião',
        color: '#6BCB77',
        userId: user.id,
      },
    }),
  ]);

  console.log('Created labels:', labels.map(l => l.name).join(', '));

  // Create sample tasks
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Revisar código do projeto',
        description: 'Verificar PRs pendentes e fazer code review',
        priority: 'P1',
        dueDate: today,
        dueTime: '14:00',
        userId: user.id,
        projectId: projects[0].id,
        labels: {
          create: [{ labelId: labels[0].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Reunião com equipe',
        description: 'Daily standup - discutir progresso do sprint',
        priority: 'P2',
        dueDate: tomorrow,
        dueTime: '10:00',
        userId: user.id,
        projectId: projects[0].id,
        labels: {
          create: [{ labelId: labels[2].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Ir à academia',
        priority: 'P3',
        dueDate: today,
        dueTime: '18:00',
        userId: user.id,
        projectId: projects[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Comprar presente de aniversário',
        priority: 'P2',
        dueDate: nextWeek,
        userId: user.id,
        projectId: projects[1].id,
        labels: {
          create: [{ labelId: labels[1].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Organizar documentos',
        description: 'Separar documentos importantes para arquivo',
        priority: 'P4',
        userId: user.id,
        projectId: inbox.id,
      },
    }),
  ]);

  console.log('Created tasks:', tasks.length);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
