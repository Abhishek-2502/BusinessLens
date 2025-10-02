# Frontend (Vite + React)
FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose Vite dev server
EXPOSE 5173

# Run dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


# docker build -t businesslens/frontend:latest -f frontend.Dockerfile .
# docker run -p 5173:5173 -d --name businesslens-frontend businesslens/frontend:latest

# Push to Docker Hub
# docker tag businesslens/frontend:latest abhi25022004/businesslens-frontend:latest
# docker push abhi25022004/businesslens-frontend:latest