# Stage 1: Build the Node.js app
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy dependency files first for efficient caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the internal port for Node.js (optional, for development)
EXPOSE 3000

# Stage 2: Set up Nginx for the Node.js app
FROM nginx:stable-alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the Node.js app code from the build stage to the new container
COPY --from=build /app /app

# Expose the external port for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
