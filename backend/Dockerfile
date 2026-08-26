# Use official OpenJDK 21 image
FROM eclipse-temurin:21-jdk-alpine

# Set working directory
WORKDIR /app

# Copy the built jar file
COPY target/*.jar app.jar

# Expose port 8080 (Cloud Run expects this)
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
