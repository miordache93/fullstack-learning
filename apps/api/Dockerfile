FROM node:24-alpine AS dependencies
WORKDIR /workspace
COPY package.json package-lock.json nx.json tsconfig.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY libs/backend/core/package.json libs/backend/core/package.json
COPY libs/frontend/ui/package.json libs/frontend/ui/package.json
RUN npm ci

# WHAT: Build a reusable one-shot image that owns migration execution, not API replicas.
FROM dependencies AS migration
COPY prisma.config.ts ./
COPY prisma ./prisma
CMD ["npx", "prisma", "migrate", "deploy"]

FROM dependencies AS build
COPY . .
# WHY: Regenerate from the checked-in schema so a stale client cannot reach compilation.
RUN DATABASE_URL=postgresql://unused:unused@localhost:5432/unused npx prisma generate
RUN npx nx build api --configuration=production

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY libs/backend/core/package.json libs/backend/core/package.json
COPY libs/frontend/ui/package.json libs/frontend/ui/package.json
RUN npm ci --omit=dev --omit=optional && npm cache clean --force
COPY --from=build /workspace/apps/api/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
