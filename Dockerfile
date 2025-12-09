# Build Stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Accept BASE_URL as a build argument
ARG BASE_URL
ENV VITE_BASE_URL=$BASE_URL

RUN npm run build

# Production Stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
# Copy nginx config to templates directory for env substitution
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Default PORT to 8080 if not set
ENV PORT=8080

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
