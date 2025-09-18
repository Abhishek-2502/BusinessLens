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
