# Nest Template

Template base de API com NestJS, Prisma e autenticação JWT, já preparado para multi-tenancy em `single database`.

## O que já vem pronto

- `NestJS` com estrutura modular.
- `Prisma` com `PostgreSQL`.
- `JWT` para autenticação.
- Módulo de `tenants`.
- Módulo de `users`.
- Resposta padronizada com interceptor global.
- Tratamento global de exceções.
- Escopo multi-tenant via `tenantId` em todas as operações de usuário.

## Estratégia de multi-tenancy

Este template usa `single database multi-tenancy`.

- Existe uma tabela `tenants`.
- A tabela `users` possui a coluna `tenantId`.
- Toda autenticação é feita com `tenantSlug + cpf + password`.
- Após o login, o token carrega `sub`, `tenantId` e `role`.
- As rotas autenticadas de usuários só enxergam registros do tenant do token.

Isso deixa a base simples para evoluir e já evita vazamento de dados entre tenants.

## Estrutura principal

```text
src/
  common/
  infrastructure/
    database/prisma/
    env/
  modules/
    auth/
    cryptography/
    tenants/
    users/
prisma/
  schema.prisma
```

## Como subir

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate --name init
pnpm prisma:seed
pnpm start:dev
```

A aplicação sobe por padrão em `http://localhost:3333/api`.

## Variáveis de ambiente

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nest_template?schema=public"
JWT_SECRET="change-me-with-at-least-32-characters"
PORT=3333
NODE_ENV="development"
```

## Fluxo inicial recomendado

1. Rodar o seed inicial.
2. Fazer login com `tenantSlug`, `cpf` e `password`.
3. Consumir as rotas protegidas com `Authorization: Bearer <token>`.
4. Criar novos tenants e usuários conforme o projeto evoluir.

## Seed padrão

O comando abaixo cria um tenant e um admin padrão:

```bash
pnpm prisma:seed
```

Dados criados:

- `tenantSlug`: `default`
- `email`: `admin@template.local`
- `cpf`: `00000000000`
- `password`: `123456`

## Endpoints base

### Criar tenant

`POST /api/tenants`

```json
{
  "name": "Rentz",
  "slug": "rentz"
}
```

### Criar usuário

`POST /api/users`

```json
{
  "tenantId": "uuid-do-tenant",
  "name": "Admin",
  "email": "admin@rentz.com",
  "cpf": "12345678900",
  "phone": "85999999999",
  "password": "123456",
  "role": "admin"
}
```

### Login

`POST /api/auth/login`

```json
{
  "tenantSlug": "rentz",
  "cpf": "12345678900",
  "password": "123456"
}
```

### Listar usuários do tenant autenticado

`GET /api/users`

Header:

```text
Authorization: Bearer <token>
```

### Buscar usuário por id

`GET /api/users/:id`

### Atualizar usuário

`PUT /api/users/:id`

### Remover usuário

`DELETE /api/users/:id`

## Comandos úteis

```bash
pnpm start:dev
pnpm build
pnpm lint
pnpm prisma:generate
pnpm prisma:migrate --name init
pnpm prisma:seed
pnpm prisma:studio
```

## Observações

- O retorno dos endpoints de usuário não expõe `password`.
- `email` e `cpf` são únicos por tenant, não globalmente.
- O template está propositalmente enxuto para servir de base e crescer por módulos.
- Se você quiser, o próximo passo natural é adicionar `roles/permissions`, `refresh token`, `auditoria` e mais domínios de negócio.
