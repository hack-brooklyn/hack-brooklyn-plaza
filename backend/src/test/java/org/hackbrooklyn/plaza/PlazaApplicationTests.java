package org.hackbrooklyn.plaza;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.security.Security;
import java.util.TimeZone;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
class PlazaApplicationTests {

    @BeforeAll
    static void initializeTestEnvironment() {
        // Set app-wide timezone to UTC for consistency across environments
        TimeZone.setDefault(TimeZone.getTimeZone("Etc/UTC"));

        // Add BouncyCastle to Security
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    @Test
    void contextLoads() {
    }

}
