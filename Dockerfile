# Stage 1: Build and run the Node.js application
FROM node:16 AS node_app

# Set the working directory
WORKDIR /app

# Copy dependency files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the Node.js server
CMD ["node", "index.js"]

# Stage 2: Configure and run Nginx
FROM nginx:stable-alpine

# Copy the Node.js application from the first stage
COPY --from=node_app /app /usr/share/nginx/html

# Create an Nginx configuration file
RUN echo 'server { \
    listen 80; \
    \
    location / { \
        proxy_pass http://localhost:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
