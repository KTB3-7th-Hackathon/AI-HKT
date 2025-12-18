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

# Frontend runtime only
FROM nginx:1.27-alpine AS frontend
COPY apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

