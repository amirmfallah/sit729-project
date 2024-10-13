# Use the official Node.js image from Docker Hub
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json /app/

# Install dependencies
RUN npm install

# Copy all source files to the container's /app directory
COPY . /app/

# Expose the port that your Express app will use
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
