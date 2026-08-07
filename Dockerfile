# Build reproductible du site statique, puis service par nginx.
# Utile pour un auto-hébergement ; pour Cloudflare Pages / Netlify le build
# est fait par la plateforme (cf. README) et cette image n'est pas nécessaire.

FROM node:22-alpine AS build
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=1
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
