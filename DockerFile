# Use lightweight Node image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all source code
COPY . .

# Expose the internal port
EXPOSE 3001

# Start the server (keeps the container running)
CMD ["node", "index.js"]
