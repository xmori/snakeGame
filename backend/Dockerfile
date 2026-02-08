# Stage 1: Builder
FROM maven:3.8.7-eclipse-temurin-17 AS build
WORKDIR /app

# Copia o arquivo pom.xml e baixa as dependÃªncias
COPY pom.xml .
RUN mvn dependency:go-offline

# Copia o restante do cÃ³digo-fonte e compila o aplicativo
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Imagem de execuÃ§Ã£o
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copia o jar gerado na etapa de build
COPY --from=build /app/target/snakegame-0.0.1-SNAPSHOT.jar app.jar

# ExpÃµe a porta definida na aplicaÃ§Ã£o (por padrÃ£o, 8080)
EXPOSE 8080

# Comando para iniciar a aplicaÃ§Ã£o
ENTRYPOINT ["java", "-jar", "app.jar"]

