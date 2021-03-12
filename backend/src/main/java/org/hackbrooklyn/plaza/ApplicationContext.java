package org.hackbrooklyn.plaza;

import com.sendgrid.SendGrid;
import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.util.AwsS3Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Slf4j
@Configuration
public class ApplicationContext {

    private final Environment environment;

    @Autowired
    public ApplicationContext(Environment environment) {
        this.environment = environment;
    }

    @Bean
    public RedisTemplate<String, String> refreshTokenBlocklistRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        return template;
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
    SendGrid sendGrid() {
        return new SendGrid(environment.getProperty("SENDGRID_API_KEY"));
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // @Value does not inject in time for the bean to read the environment variable
                // Use environment.getProperty here instead
                registry.addMapping("/**").allowedOrigins(environment.getProperty("FRONTEND_DOMAIN"));
            }
        };
    }
}
