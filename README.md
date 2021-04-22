# Hack Brooklyn Plaza

Hack Brooklyn Plaza is the digital platform for the Hack Brooklyn hackathon. Built with Java, Spring Boot, TypeScript,
and React, with PostgreSQL as the database.

## Getting Started

### Prerequisites

- Hack Brooklyn Plaza requires Node.js for the frontend and Java 8 for the backend to build and run.
    - [Node.js (14.16.1 LTS recommended)](https://nodejs.org/en/)
    - [Java SE Development Kit 8 (8u281 recommended)](https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html)
- The Spring Boot backend requires a Hibernate-compatible database and a Redis data store. Hack Brooklyn Plaza was
  developed with PostgreSQL in mind, but you may use any database supported by the Hibernate ORM.
    - [PostgreSQL (13.2 recommended)](https://www.postgresql.org/download/)
    - [Redis (6.2 recommended)](https://redis.io/download)
- Maven is required to build and run the backend. You can [install Maven](https://maven.apache.org/download.cgi) or use
  the included Maven `mvnv` wrapper in the `backend/` directory. When using the `mvnv` wrapper, substitute the `mvn`
  commands below with `./mvnv`.
- To store uploaded data, Hack Brooklyn Plaza uses an AWS S3 bucket. Refer
  the [S3 documentation](https://aws.amazon.com/s3/) for more information about setting up a S3 bucket.
- To send transactional emails across the app, Hack Brooklyn Plaza utilizes the SendGrid API via the official Java
  library. Refer to
  the [SendGrid API documentation](https://sendgrid.com/docs/for-developers/sending-email/api-getting-started/#prerequisites-for-sending-your-first-email-with-the-sendgrid-api)
  for more information about getting your API key for using the SendGrid API.
- To subscribe members to the hackathon's mailing list, Hack Brooklyn Plaza utilizes the Mailchimp Marketing API. Refer
  to the [Mailchimp developer documentation](https://mailchimp.com/developer/marketing/guides/quick-start/) for more
  information about getting your API key and settings for using the Mailchimp Marketing API.

### Running in Development Mode

#### Frontend

1. Navigate to the `/frontend` directory.
2. Set the appropriate environment variables on your computer by referring to the `frontend/example.env` example file.
3. Run `npm install` to install the necessary dependencies.
4. Run `npm start` to start the development server.

#### Backend

1. Navigate to the `/backend` directory.
2. Set the appropriate environment variables on your computer by referring to the `backend/example.env` example file.
3. Run `mvn spring-boot:run` to start the development server.

By default, the frontend will run on [http://localhost:3000](http://localhost:3000) and the backend will run
on http://localhost:PORT where PORT is the port defined by the `PORT` environment variable.

### Building and Deploying to Production

#### Building the Frontend

1. Navigate to the `/frontend` directory.
2. Set the appropriate environment variables on your computer by referring to the `frontend/example.env` example file.
3. Run `npm install` to install the necessary dependencies.
4. Run `npm run build` to create a production build of the React frontend.
5. The frontend has been built to the `build` directory and can now be deployed to a web server in your production
   environment.

### Building the Backend

The Spring Boot backend can be built and deployed as a standalone `.jar` or as a Docker container to your production
environment.

#### Deploying a Standalone `.jar`

1. Navigate to the `/backend` directory.
2. Set the appropriate environment variables on your computer by referring to the `backend/example.env` example file.
3. Run `mvn package` to compile the Java Spring Boot application.
4. The backend has been built to the `target` directory as `plaza-*.jar` and can now be deployed to your production
   environment.

#### Deploying a Docker Container

The backend contains a `Dockerfile` that can be used to run Hack Brooklyn Plaza. Refer to
the [official Docker documentation](https://docs.docker.com/engine/reference/commandline/build/) for instructions on
building and tagging your resulting image. If you prefer to, you can also use the official pre-built Docker image by
downloading and pulling the latest image using `docker pull hackbrooklyn/hack-brooklyn-plaza`.

After you have obtained the image, configure the environment variables for your use case by referring to
the `backend/example.env` example file.

You are now ready to deploy the containerized application to your production environment.

- For deployment onto AWS ECS, refer
  to [the official AWS ECS documentation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) for
  instructions on how to deploy the image and to add your environment variables.
- For running the Docker container on its own, refer
  to [the official Docker documentation](https://docs.docker.com/engine/reference/commandline/run/) for instructions on
  running your image. Be sure to specify the `--env-file` option with your configured environment variables.

## Tech Stack

### Frontend

- TypeScript
- React
- Redux
- Bootstrap
- Styled Components
- React Router
- Redux Thunk
- Formik

### Backend

- Java
- Spring Framework
    - Spring Boot
    - Spring Data JPA
    - Spring Data Redis
    - Spring Security with JWT authentication
    - Spring Web
    - Spring Reactive Web
- JPA
- Hibernate ORM

### Databases and Infrastructure

- PostgreSQL
- Redis
- Docker
- Amazon Web Services (AWS)
    - EC2
    - ECS
    - RDS
    - ElastiCache
    - S3

### Additional Services

- Mailchimp (via API)
- SendGrid (via Java Library)

## License

Hack Brooklyn Plaza is licensed under the [GPL-3.0](LICENSE) License.
