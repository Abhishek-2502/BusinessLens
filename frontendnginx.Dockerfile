# Stage 1: Build React app
FROM node:18 as build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build output from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]


# Build the Docker image
# docker build -t businesslens/frontend:latest -f frontend.Dockerfile .

# Run the container
# docker run -p 80:80 -d --name businesslens-frontend businesslens/frontend:latest

# Push to Docker Hub
# docker tag businesslens/frontend:latest abhi25022004/businesslens-frontend:latest
# docker push abhi25022004/businesslens-frontend:latest