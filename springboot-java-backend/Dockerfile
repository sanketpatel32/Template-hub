FROM gradle:8.10-jdk21 AS build
WORKDIR /app
COPY . .
RUN gradle clean bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar /app/app.jar
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["sh", "-c", "java -jar /app/app.jar --server.port=${PORT}"]
