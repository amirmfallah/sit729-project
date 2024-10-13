# Use the official Node.js image from Docker Hub
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Install all project dependencies
RUN npm install

# Copy all source code files to the container
COPY . .

# Expose the port that your Express app is running on
EXPOSE 3000

# Start the Express server
CMD ["node", "server.js"]
