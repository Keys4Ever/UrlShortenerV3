FROM node:18-alpine
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app/apps/backend
ENV CI=true
RUN pnpm install
RUN pnpm run build
EXPOSE 3000
CMD ["pnpm", "run", "start:prod"]
