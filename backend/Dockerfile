# Use official lightweight Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package manifests first for efficient docker caching
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose port (Render automatically provides $PORT)
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Start Node.js Express server
CMD ["node", "server.js"]
