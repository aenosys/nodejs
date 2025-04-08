# Use an official Node image as the base
FROM node:latest

# Set the working directory
WORKDIR /app

# Install necessary packages
RUN apt-get update && \
    apt-get install -y openssh-server && \
    rm -rf /var/lib/apt/lists/*

# Set up SSH server and configure sshuser
RUN mkdir /var/run/sshd && \
    useradd -ms /bin/bash sshuser && \
    echo "sshuser:password" | chpasswd  # Replace 'password' with a secure password

# Configure SSH server
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Install sudo for sshuser and set permissions
RUN apt-get update && \
    apt-get install -y sudo && \
    echo 'sshuser ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Copy application dependencies
COPY package*.json ./
RUN npm install

# Copy the application files
COPY . .

# Expose the application port and SSH port
EXPOSE 6750 22

# Start SSH and your application
CMD service ssh start && node index.js
