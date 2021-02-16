FROM maven:3.6.3-openjdk-8 AS builder
WORKDIR /build
# Environment variables for tests
ENV MAILCHIMP_API_KEY=fakekey
ENV MAILCHIMP_SERVER=fakeserver
ENV MAILCHIMP_LIST_ID=fakelistid
ENV GENERAL_APPLICATION_DEADLINE=2021-01-01T00:00:00-00:00
ENV AWS_S3_BUCKET=hack-brooklyn-plaza-test
COPY pom.xml ./
COPY ./src/ ./src/
RUN mvn package

FROM openjdk:8

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

WORKDIR /hack-brooklyn-plaza
COPY --from=builder /build/target/plaza-*.jar ./hack-brooklyn-plaza.jar
CMD java -jar hack-brooklyn-plaza.jar
