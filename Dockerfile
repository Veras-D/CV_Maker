# Dockerfile for CV Maker & Role Tracker (Tauri / Vite TS)
FROM node:20-alpine AS base
WORKDIR /app

# Install system dependencies for build/canvas if needed
RUN apk add --no-libc-compat --no-cache cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev build-base

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Build web frontend bundle
RUN npm run build

# Stage 2: Development & Production Web Preview Container
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=base /app /app

EXPOSE 1420 4173

CMD ["npm", "run", "dev", "--", "--host"]
