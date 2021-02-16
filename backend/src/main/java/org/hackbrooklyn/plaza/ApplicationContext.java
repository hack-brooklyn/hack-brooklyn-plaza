package org.hackbrooklyn.plaza;

import org.hackbrooklyn.plaza.util.AwsS3Utils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationContext {

    @Bean
    AwsS3Utils awsS3Utils() {
        return new AwsS3Utils();
    }
}
