# Use an official Node image as the base. It includes a non-root 'node' user.
FROM node:latest

# Set the working directory for the application
WORKDIR /app

# 1. Update package lists and install the OpenSSH server
# 2. Clean up the apt cache to keep the image size down
RUN apt-get update && \
    apt-get install -y openssh-server && \
    rm -rf /var/lib/apt/lists/*

# 1. Create the .ssh directories for users you intend to support.
#    The /var/run/sshd directory will be created by the service script at runtime.
RUN mkdir -p /root/.ssh && \
    chmod 700 /root/.ssh && \
    mkdir -p /home/node/.ssh && \
    chown node:node /home/node/.ssh && \
    chmod 700 /home/node/.ssh

# Configure the SSH Server for a secure, key-only setup
RUN sed -i 's/^#?PermitRootLogin .*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config && \
    sed -i 's/^#?PubkeyAuthentication .*/PubkeyAuthentication yes/' /etc/ssh/sshd_config && \
    sed -i 's/^#?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config && \
    sed -i 's/^#?ChallengeResponseAuthentication .*/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config

# --- NO 'COPY authorized_keys' is needed here. Your app does this at runtime. ---

# Copy application dependency files
COPY package*.json ./
# Install app dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Expose the application port and the SSH port
EXPOSE 3000 22 # Assuming your app runs on 3000

# FIX: Use the service wrapper to ensure all prerequisites are met at runtime.
# This command starts the SSH service in the background and executes the Node.js application
# in the foreground. 'exec' makes the Node app the main process.
CMD service ssh start && exec node index.js
