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

# Pre-cache ALL Tauri AppImage & linuxdeploy bundler binaries in /root/.cache/tauri to bypass GitHub rate limits
RUN mkdir -p /root/.cache/tauri && \
    curl -L -o /root/.cache/tauri/appimagetool-x86_64.AppImage https://github.com/AppImage/AppImageKit/releases/download/13/appimagetool-x86_64.AppImage || true && \
    curl -L -o /root/.cache/tauri/AppRun-x86_64 https://github.com/tauri-apps/binary-releases/releases/download/apprun-old/AppRun-x86_64 || true && \
    curl -L -o /root/.cache/tauri/linuxdeploy-x86_64.AppImage https://github.com/tauri-apps/binary-releases/releases/download/linuxdeploy/linuxdeploy-x86_64.AppImage || true && \
    curl -L -o /root/.cache/tauri/linuxdeploy-plugin-gtk.sh https://raw.githubusercontent.com/tauri-apps/linuxdeploy-plugin-gtk/master/linuxdeploy-plugin-gtk.sh || true && \
    curl -L -o /root/.cache/tauri/linuxdeploy-plugin-gstreamer.sh https://raw.githubusercontent.com/tauri-apps/linuxdeploy-plugin-gstreamer/master/linuxdeploy-plugin-gstreamer.sh || true && \
    curl -L -o /root/.cache/tauri/linuxdeploy-plugin-appimage-x86_64.AppImage https://github.com/linuxdeploy/linuxdeploy-plugin-appimage/releases/download/continuous/linuxdeploy-plugin-appimage-x86_64.AppImage || true && \
    chmod -R +x /root/.cache/tauri/

COPY --from=web-builder /app /app

# Build standalone Desktop App executable via Tauri CLI & appimagetool inside Docker
CMD ["./build_app.sh"]
