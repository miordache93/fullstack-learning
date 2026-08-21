FROM node:24-alpine AS dependencies
WORKDIR /workspace
COPY package.json package-lock.json nx.json tsconfig.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY libs/backend/core/package.json libs/backend/core/package.json
COPY libs/frontend/ui/package.json libs/frontend/ui/package.json
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npx nx build @nx-fullstack-learning/web --configuration=production

FROM nginx:1.29-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
