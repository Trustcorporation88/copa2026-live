# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.json tsconfig.base.json ./
COPY lib ./lib
COPY artifacts ./artifacts

RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
