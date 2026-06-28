# Nest Template

Template de API com NestJS, Prisma e autenticação JWT, organizado para servir como base de projetos multi-tenant em `single database`.

## Visão geral

Este projeto foi estruturado para separar bem:

- bootstrap da aplicação
- infraestrutura compartilhada
- contratos e implementações de acesso a dados
- regras de negócio por módulo
- camada HTTP

A ideia é que novos domínios sigam o mesmo desenho usado aqui em `tenants` e `users`.

## Arquitetura

O projeto está dividido em três blocos principais:

### `src/main.ts`

Ponto de entrada da aplicação.

Aqui ficam as decisões globais de runtime:

- criação da aplicação Nest
- `ValidationPipe`
- filtro global de exceções
- interceptor global de resposta
- prefixo global `/api`
- CORS

### `src/infrastructure`

Camada de infraestrutura transversal.

- `env/`: valida e expõe variáveis de ambiente
- `database/prisma/`: registra o `PrismaService` como provider global

Essa camada cuida de dependências técnicas, não de regra de negócio.

### `src/modules`

Camada modular da aplicação.

Cada domínio fica isolado no seu próprio módulo, com responsabilidades separadas em:

- `dtos/`: contrato de entrada e validação
- `entities/`: tipos e estruturas do domínio
- `repositories/`: contrato abstrato e implementação concreta
- `services/`: regra de negócio
- `http/`: controllers e rotas

Esse padrão ajuda a manter a aplicação previsível quando novos módulos forem adicionados.

## Estrutura de pastas

```text
src/
  common/
    decorators/
    domain/
    exceptions/
    interceptors/
    utils/
  infrastructure/
    database/
      prisma/
    env/
  lib/
    prisma.ts
  modules/
    auth/
    cryptography/
    tenants/
    users/
  app.module.ts
  main.ts

prisma/
  generated/
  migrations/
  schema.prisma
  seeds/

Dockerfile
docker-compose.yml
.env.example
```

## Módulos atuais

### `auth`

Responsável pela autenticação.

Fluxo principal:

1. recebe `tenantSlug`, `cpf` e `password`
2. valida se o tenant existe e está ativo
3. busca o usuário dentro do tenant
4. compara a senha com `bcrypt`
5. emite um JWT com `sub`, `tenantId` e `role`

Também é o módulo que registra o `JwtAuthGuard` global.

### `tenants`

Responsável pela criação e consulta de tenants.

Hoje ele representa a base da estratégia multi-tenant e serve como dependência para outros módulos que precisem validar contexto organizacional.

### `users`

Responsável pelo CRUD de usuários.

As regras principais do módulo já nascem tenant-aware:

- criação depende de um tenant válido
- `email` e `cpf` são únicos por tenant
- listagem, busca, atualização e remoção usam `tenantId` do token
- a senha nunca é retornada na resposta

### `cryptography`

Centraliza abstrações e implementações de segurança:

- geração de hash
- comparação de hash
- geração de token

Isso evita acoplamento direto dos services a bibliotecas como `bcryptjs` e `@nestjs/jwt`.

## Fluxo de requisição

Em alto nível, as requisições seguem este caminho:

```text
Controller -> DTO -> Service -> Repository Contract -> Repository Implementation -> Prisma
```

Esse fluxo foi escolhido para:

- manter controllers finos
- concentrar regra de negócio em services
- permitir trocar implementação de repositório sem quebrar os módulos
- facilitar crescimento do código sem misturar transporte, domínio e persistência

## Multi-tenancy

O projeto usa a estratégia `single database`.

### Como está modelado

- existe uma tabela `Tenant`
- existe uma tabela `User` com chave estrangeira `tenantId`
- as unicidades de usuário são compostas por tenant

Exemplos:

- `@@unique([tenantId, email])`
- `@@unique([tenantId, cpf])`

### Como isso aparece na aplicação

- o login exige `tenantSlug`
- o token carrega `tenantId`
- os services de `users` usam `tenantId` para isolar as operações

Esse desenho serve como referência para qualquer novo módulo que precise respeitar escopo por tenant.

## Camada comum

`src/common` concentra elementos reutilizáveis da aplicação:

- exceções de domínio
- filtro global de erro
- interceptor de resposta
- decorators compartilhados
- utilitários auxiliares

Isso evita duplicação entre módulos e mantém o comportamento HTTP padronizado.

## Persistência com Prisma

O schema principal está em [prisma/schema.prisma](/Users/monnueryjunior/Projects/backend/nest-template/prisma/schema.prisma:1).

O projeto usa Prisma com adapter PostgreSQL:

- `PrismaService` dentro da aplicação Nest
- `src/lib/prisma.ts` para uso fora do container Nest, como o seed

O client gerado fica em `prisma/generated`, o que deixa explícita a separação entre código manual e código gerado.

## Seed

O seed está em prisma/seeds/script.ts.

Ele cria ou atualiza:

- um tenant padrão `default`
- um usuário admin padrão dentro desse tenant

Isso facilita subir a base e testar autenticação imediatamente.

## Docker

O projeto também possui uma estrutura pronta para execução containerizada:

- Dockerfile para build da aplicação
- docker-compose.yml para orquestrar API + PostgreSQL

No fluxo Docker, a aplicação sobe executando:

1. migrations
2. seed
3. aplicação em modo produtivo

## Variáveis de ambiente

O arquivo base está em [.env.example](/Users/monnueryjunior/Projects/backend/nest-template/.env.example:1).

Variáveis principais:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `NODE_ENV`

## Como começar

### Local

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate --name init
pnpm prisma:seed
pnpm start:dev
```

### Docker

```bash
docker compose up --build
```

## Endpoints base

- `POST /api/tenants`
- `POST /api/users`
- `POST /api/auth/login`
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

## Como expandir o template

Ao adicionar um novo domínio, a ideia é repetir o mesmo padrão:

1. criar o módulo
2. definir DTOs
3. definir contratos de repositório
4. implementar services com regra de negócio
5. implementar controllers
6. propagar `tenantId` para a persistência quando o domínio for multi-tenant

Isso mantém consistência entre os módulos e evita que a arquitetura se degrade conforme o projeto cresce.
