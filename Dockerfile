# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy root package files and install root deps
COPY package*.json ./
RUN npm install

# Copy backend package files and install backend deps
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy the rest of the project (frontend + backend)
COPY . .

# Expose both frontend (5173) and backend (5000) ports
EXPOSE 5173 5000

# Default command: run both frontend and backend
CMD ["npm", "run", "dev"]


# docker build -t businesslens/fullstack:latest -f Dockerfile .
# docker run -p 5173:5173 -p 5000:5000 -d --name businesslens-fullstack --env-file ./server/.env businesslens/fullstack:latest

# Push to Docker Hub
# docker tag businesslens/fullstack:latest abhi25022004/businesslens-fullstack:latest
# docker push abhi25022004/businesslens-fullstack:latest

