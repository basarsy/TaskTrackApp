# ---------- Stage 1: Build the frontend ----------
FROM node:20 AS build
WORKDIR /app

# Install dependencies
COPY FrontService/package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY FrontService/ ./

# Build for production
RUN npm run build


# ---------- Stage 2: Serve with nginx ----------
FROM nginx:stable-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (SPA routing + API proxy)
COPY FrontService/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
