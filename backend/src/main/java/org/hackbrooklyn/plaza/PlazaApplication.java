package org.hackbrooklyn.plaza;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.security.Security;
import java.util.TimeZone;

@SpringBootApplication
public class PlazaApplication {

    public static void main(String[] args) {
        // Set app-wide timezone to UTC for consistency across environments
        TimeZone.setDefault(TimeZone.getTimeZone("Etc/UTC"));

        // Add BouncyCastle to Security
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }

        SpringApplication.run(PlazaApplication.class, args);
    }
}
