# Multi-stage Dockerfile for BhuNetra Platform (FastAPI + React Production Build)

# -------------------------------------------------------------
# Stage 1: Build the React TypeScript Frontend
# -------------------------------------------------------------
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Python Backend & Runtime Environment
# -------------------------------------------------------------
FROM python:3.12-slim AS runner
WORKDIR /app

# Install system dependencies for geospatial libraries & runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    libexpat1 \
    libgomp1 \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application, data, models, and scripts
COPY backend/ ./backend/
COPY data/ ./data/
COPY models/ ./models/
COPY scripts/ ./scripts/

# Copy compiled frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Ensure required writable directories exist
RUN mkdir -p /app/reports /app/data/rasters /app/data/exports

# Environment variables
ENV PYTHONPATH="/app:/app/backend"
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Railway passes $PORT dynamically at runtime
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
