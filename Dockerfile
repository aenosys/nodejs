# =================================================================
# STAGE 1: The "Builder"
# We use a full Alpine image here because it has the build tools
# we need to install dependencies.
# =================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install ALL dependencies, including devDependencies needed for building
RUN npm install

# Copy the rest of your application source code
COPY . .

# If you have a build step (e.g., for TypeScript), run it here
# RUN npm run build

# =================================================================
# STAGE 2: The Final Production Image
# We start from a fresh, clean Alpine image. This image will be
# incredibly small.
# =================================================================
FROM node:18-alpine

WORKDIR /app

# --- CRITICAL STEP ---
# Copy ONLY the production dependencies from the 'builder' stage.
# We also copy package.json so the app can see its version, etc.
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./

# --- CRITICAL STEP ---
# Copy ONLY your application's compiled code (or source if not compiled).
# For this example, we assume the entrypoint is index.js
COPY --from=builder /app/index.js ./
# If you have a 'dist' folder, you would copy that instead:
# COPY --from=builder /app/dist ./dist

# The 'node' user is included in the official Node images.
# It's a good security practice to run as a non-root user.
USER node

# Expose the application port
EXPOSE 3000

# The command to run your application
CMD [ "node", "index.js" ]
