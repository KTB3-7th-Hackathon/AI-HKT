# syntax=docker/dockerfile:1

# Backend build
FROM eclipse-temurin:21-jdk AS backend-build
WORKDIR /app
COPY apps/backend/gradlew ./
COPY apps/backend/gradle ./gradle
COPY apps/backend/build.gradle* apps/backend/settings.gradle* ./
RUN chmod +x gradlew
COPY apps/backend/src ./src
RUN ./gradlew --no-daemon clean bootJar -x test

# Backend runtime
FROM eclipse-temurin:21-jre AS backend
WORKDIR /app
COPY --from=backend-build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# Frontend build
FROM node:20-alpine AS frontend-build
WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY apps/frontend/package*.json ./
RUN npm ci
COPY apps/frontend/ .
RUN npm run build

# Frontend runtime
FROM nginx:1.27-alpine AS frontend
COPY --from=frontend-build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
