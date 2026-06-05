# ── Stage 1: Build React app ──────────────────────────────────────────────────
FROM node:18-alpine AS build
WORKDIR /app

# Install deps first — cached layer until package.json changes
COPY package*.json ./
RUN npm install --silent

COPY . .
# CRA 5.x requires legacy OpenSSL provider on Node 17+
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

# ── Stage 2: Serve with nginx ─────────────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/build      /usr/share/nginx/html
COPY nginx.conf                    /etc/nginx/conf.d/default.conf
EXPOSE 80
