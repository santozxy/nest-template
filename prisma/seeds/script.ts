import 'dotenv/config';
import { hash } from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {
      name: 'Default Tenant',
      isActive: true,
    },
    create: {
      name: 'Default Tenant',
      slug: 'default',
      isActive: true,
    },
  });

  const passwordHash = await hash('123456', 8);

  const existingUser = await prisma.user.findFirst({
    where: {
      tenantId: tenant.id,
      email: 'admin@template.local',
    },
  });

  if (existingUser) {
    await prisma.user.update({
      where: {
        tenantId_id: {
          tenantId: tenant.id,
          id: existingUser.id,
        },
      },
      data: {
        name: 'Template Admin',
        cpf: '00000000000',
        phone: '85999999999',
        password: passwordHash,
        role: UserRole.admin,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: 'Template Admin',
        email: 'admin@template.local',
        cpf: '00000000000',
        phone: '85999999999',
        password: passwordHash,
        role: UserRole.admin,
      },
    });
  }

  console.info('Seed executado com sucesso.');
  console.info('Tenant slug: default');
  console.info('Admin email: admin@template.local');
  console.info('Admin cpf: 00000000000');
  console.info('Admin password: 123456');
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
