FROM node:22-alpine AS base
WORKDIR /app

RUN apk add --no-cache \
    libc6-compat \
    openssl \
    python3 \
    make \
    g++ \
    pkgconfig

COPY . .
ENV CI=true

RUN corepack enable \
  && corepack prepare pnpm@latest --activate \
  && pnpm install --frozen-lockfile \
  && npx prisma generate \
  && pnpm build

CMD ["node", "dist/src/main"]
