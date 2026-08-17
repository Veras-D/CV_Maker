# Multi-stage Dockerfile for Desktop App Build
# Stage 1: Base Node dependencies & web assets
FROM node:20-bookworm AS web-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Tauri Desktop Linux Binary Builder (Ubuntu 22.04 LTS for Maximum Linux Compatibility)
FROM ubuntu:22.04 AS tauri-desktop-builder
WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive
ENV APPIMAGE_EXTRACT_AND_RUN=1

# Install Tauri GTK, Rust toolchain & system build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libwebkit2gtk-4.1-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    javascriptcoregtk-4.1 \
    pkg-config \
    squashfs-tools \
    libfuse2 \
    dpkg-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Rust toolchain via rustup
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

COPY --from=web-builder /app /app

# Build standalone Desktop App executable via build_app.sh inside Docker
CMD ["./build_app.sh"]
