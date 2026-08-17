# Multi-stage Dockerfile for Desktop App Build & Dev Server
# Stage 1: Base Node dependencies
FROM node:20-bookworm AS web-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Tauri Desktop Linux Binary Builder (Rust + WebKit GTK)
FROM rust:1.78-bookworm AS tauri-desktop-builder
WORKDIR /app

# Install Tauri GTK & system dependencies
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    javascriptcoregtk-4.1 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js in Rust container
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

COPY --from=web-builder /app /app

# Build standalone Desktop App executable via Tauri CLI inside Docker
CMD ["npm", "run", "tauri", "build"]

# Stage 3: Web preview container (Optional)
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=web-builder /app /app
EXPOSE 1420
CMD ["npm", "run", "dev", "--", "--host"]
