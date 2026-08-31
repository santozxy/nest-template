import { prisma } from '@/lib/prisma';
import { UserRole } from '../generated/client';
import { hash } from 'bcryptjs';
import 'dotenv/config';

const userNames = [
  'Ana Beatriz Silva',
  'Bruno Henrique Souza',
  'Camila Ferreira Lima',
  'Daniel Oliveira Santos',
  'Eduarda Alves Costa',
  'Felipe Rocha Martins',
  'Gabriela Ribeiro Melo',
  'Henrique Carvalho Gomes',
  'Isabela Nunes Barros',
  'João Pedro Araújo',
  'Karina Monteiro Lopes',
  'Lucas Gabriel Freitas',
  'Mariana Cardoso Pinto',
  'Nicolas Vieira Castro',
  'Olívia Fernandes Reis',
  'Paulo Roberto Correia',
  'Queila Mendes Duarte',
  'Rafael Moreira Teixeira',
  'Sabrina Martins Braga',
  'Thiago Almeida Ramos',
  'Vitória Cristina Moraes',
  'William Barbosa Dias',
  'Yasmin Gonçalves Prado',
  'André Luiz Cavalcante',
  'Bianca Rodrigues Sales',
  'Caio Vinícius Farias',
  'Débora Cristina Pires',
  'Enzo Gabriel Andrade',
  'Fernanda Queiroz Campos',
  'Gustavo Henrique Leal',
  'Helena Machado Tavares',
  'Igor Matheus Cunha',
  'Júlia Vasconcelos Neves',
  'Leonardo Peixoto Borges',
  'Márcia Regina Coelho',
  'Nathan Soares Macedo',
  'Patrícia de Oliveira',
  'Renato Augusto Moura',
  'Sophia Martins Xavier',
  'Talita Cristina Paiva',
  'Vinícius de Castro',
  'Alice Menezes Brito',
  'Bernardo Lopes Amaral',
  'Cecília Ramos Dantas',
  'Diego Fernandes Luz',
  'Emanuelly Rocha Maia',
  'Fábio Júnior Santana',
  'Giovana Almeida Porto',
  'Hugo César de Lima',
  'Larissa Moreira Cruz',
] as const;

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

  const passwordHash = await hash('password', 8);

  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@syslae.com' },
  });

  if (existingUser) {
    await prisma.user.update({
      where: {
        email: 'admin@syslae.com',
      },
      data: {
        tenantId: tenant.id,
        name: 'Template Admin',
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
        email: 'admin@syslae.com',
        phone: '85999999999',
        password: passwordHash,
        role: UserRole.admin,
      },
    });
  }

  await prisma.$transaction(
    userNames.map((name, index) => {
      const userNumber = String(index + 1).padStart(2, '0');
      const phoneNumber = String(index + 1).padStart(8, '0');
      const email = `usuario${userNumber}@syslae.com`;

      return prisma.user.upsert({
        where: { email },
        update: {
          tenantId: tenant.id,
          name,
          phone: `859${phoneNumber}`,
          password: passwordHash,
          role: UserRole.member,
        },
        create: {
          tenantId: tenant.id,
          name,
          email,
          phone: `859${phoneNumber}`,
          password: passwordHash,
          role: UserRole.member,
        },
      });
    }),
  );

  console.info('Seed executado com sucesso.');
  console.info('Tenant slug: default');
  console.info('Admin email: admin@syslae.com');
  console.info('Admin password: password');
  console.info(`${userNames.length} usuários de exemplo criados/atualizados.`);
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
