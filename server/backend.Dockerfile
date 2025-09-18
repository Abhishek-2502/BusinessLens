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
