# PPCine Plugin - Universal Dockerfile
# Works on: Railway, Render, Fly.io, Google Cloud, AWS, DigitalOcean, etc.

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port (will be overridden by platform)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/health || exit 1

# Start the server
CMD ["node", "api/index.js"]
