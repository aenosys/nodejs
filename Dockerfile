# Use Alpine Linux as a parent image
FROM alpine:latest

# Install Node.js, npm, and Python
RUN apk update && \
    apk add --no-cache nodejs npm python3

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code to the working directory
COPY . .

#EXPOSE 3000
# (Optional) Specify a command to run your application
# For example, if your application starts with "node server.js":
#CMD ["node", "index.js"]
