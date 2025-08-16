# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ENV VITE_API_BASE=http://localhost:8080
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]