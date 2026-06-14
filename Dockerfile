# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json tsconfig.base.json ./
COPY lib ./lib
COPY artifacts ./artifacts

# Instala só o necessário (evita Expo/mobile). DevDeps são obrigatórias no build.
ENV CI=true
RUN pnpm install --frozen-lockfile \
  --filter @workspace/api-server... \
  --filter @workspace/copa2026...

RUN pnpm --filter @workspace/copa2026 run build \
  && pnpm --filter @workspace/api-server run build

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
