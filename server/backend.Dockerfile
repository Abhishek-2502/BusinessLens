# Backend (Express + Mongo Atlas)
FROM node:18

# Set backend workdir
WORKDIR /app/server

# Copy backend package.json & lock file
COPY server/package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source code
COPY server/ .

# Expose backend port
EXPOSE 5000

# Start backend
CMD ["npm", "run", "dev"]


# docker build -t businesslens/backend:latest -f server/backend.Dockerfile .
# docker run -p 5000:5000 -d --name businesslens-backend --env-file ./server/.env businesslens/backend:latest


# Push to Docker Hub
# docker tag businesslens/backend:latest abhi25022004/businesslens-backend:latest
# docker push abhi25022004/businesslens-backend:latest

