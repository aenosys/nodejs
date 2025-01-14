# Stage 1: Build the Node.js application
FROM node:16 AS node_app

# Set the working directory
WORKDIR /app

# Copy dependency files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Stage 2: Configure Nginx and run both processes
FROM nginx:stable-alpine

# Install supervisor for process management
RUN apk add --no-cache supervisor

# Copy the Node.js application from the first stage
COPY --from=node_app /app /app

# Configure Nginx
RUN echo 'server { \
    listen 80; \
    location / { \
        proxy_pass http://localhost:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Add Supervisor configuration
RUN echo '[supervisord] \
nodaemon=true \
[program:node] \
command=node /app/index.js \
autostart=true \
autorestart=true \
[program:nginx] \
command=nginx -g "daemon off;" \
autostart=true \
autorestart=true' > /etc/supervisord.conf

# Expose the required ports
EXPOSE 3000 80

# Start Supervisor to manage both Node.js and Nginx
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
