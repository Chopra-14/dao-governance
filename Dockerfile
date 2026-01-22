# Use official Node.js LTS (compatible with Hardhat)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Compile contracts
RUN npx hardhat compile

# Default command: run tests
CMD ["npx", "hardhat", "test"]
