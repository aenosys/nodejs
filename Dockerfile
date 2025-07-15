# Use a specific Node.js version for consistency
FROM node:20-bullseye-slim

# Set the working directory inside the container
WORKDIR /app

# Install necessary packages for SSH and process management
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssh-server sudo supervisor && \
    rm -rf /var/lib/apt/lists/*

# --- User and SSH Setup (Password-Based for Testing) ---

# Create a user named 'sshuser' and set its password
# IMPORTANT: Replace 'your-secret-password' with the password you want to use.
RUN useradd -ms /bin/bash sshuser && \
    echo "sshuser:password" | chpasswd

# Configure the SSH server to allow password authentication
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config

# Create the directory required for the SSH daemon to run
RUN mkdir /var/run/sshd

# Give 'sshuser' passwordless sudo privileges for convenience in testing
RUN echo 'sshuser ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers


# --- Application Setup ---
# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Copy the supervisor configuration file into the container
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf


# --- Ports and Final Command ---
# Expose BOTH the application port and the SSH port.
# Your deployment system will read this line to configure the network.
EXPOSE 3000 22

# Start supervisor. It will manage and run both sshd and the node app.
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
