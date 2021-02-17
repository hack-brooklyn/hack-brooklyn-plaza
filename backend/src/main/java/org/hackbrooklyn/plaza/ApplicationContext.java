package org.hackbrooklyn.plaza;

import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.util.AwsS3Utils;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Slf4j
@Configuration
public class ApplicationContext {

    private final Environment environment;

    public ApplicationContext(Environment environment) {
        this.environment = environment;
    }

    @Bean
    AwsS3Utils awsS3Utils() {
        return new AwsS3Utils();
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // @Value does not inject in time for the bean to read the environment variable
                // Use environment.getProperty here instead
                registry.addMapping("/**").allowedOrigins(environment.getProperty("APP_DOMAIN"));
            }
        };
    }
}
