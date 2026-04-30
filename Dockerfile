# Use the official Node.js 22 image
FROM node:22-slim

# Install curl for healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy necessary files to the container
COPY package*.json ./
# COPY .next ./.next
# COPY public ./public
COPY uploads ./uploads

# Install production dependencies
RUN npm install --production

COPY . .
RUN npm run build

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
