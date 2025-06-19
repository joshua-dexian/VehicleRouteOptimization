# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Build the Vite app
RUN npm run build

# Install serve to serve the built app
RUN npm install -g serve

# Expose Vite or serve port
EXPOSE 5173

# Serve the build folder
CMD ["serve", "-s", "dist", "-l", "5173"]
