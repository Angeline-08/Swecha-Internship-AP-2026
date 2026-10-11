# Build the Spring Boot application with Maven (no Maven wrapper required).
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src/ src/
RUN mvn -B clean package -DskipTests

# Run the packaged application in a smaller JRE image.
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S shopverse && adduser -S shopverse -G shopverse
COPY --from=builder /app/target/*.jar app.jar
RUN chown shopverse:shopverse app.jar
USER shopverse
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
