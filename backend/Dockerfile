FROM maven:3.6.3-openjdk-8 AS builder
WORKDIR /build
COPY pom.xml ./
COPY ./src/ ./src/
RUN mvn package -Dmaven.test.skip=true

FROM openjdk:8
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
WORKDIR /hack-brooklyn-plaza
COPY --from=builder /build/target/plaza-*.jar ./hack-brooklyn-plaza.jar
CMD java -jar hack-brooklyn-plaza.jar
