FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Default to development mode (can be overridden by docker-compose)
ENV NODE_ENV=development

# Run the application (dev by default, override with CMD in docker-compose)
CMD ["npm", "run", "dev"]
