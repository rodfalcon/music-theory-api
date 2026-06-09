# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# initialize phase downloads dd-java-agent.jar via maven-dependency-plugin
RUN mvn clean package -DskipTests --no-transfer-progress

# ── Stage 2: Run ──────────────────────────────────────────────────────────────
# Manual -javaagent used here because the cluster SSI is configured for dotnet/js only.
# To remove this, add Java to the DatadogAgent CR's instrumentation target.
FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /app/target/*.jar             app.jar
COPY --from=build /app/target/dd-java-agent.jar dd-java-agent.jar
EXPOSE 8081
ENTRYPOINT ["java", \
  "-javaagent:/app/dd-java-agent.jar", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "/app/app.jar"]
