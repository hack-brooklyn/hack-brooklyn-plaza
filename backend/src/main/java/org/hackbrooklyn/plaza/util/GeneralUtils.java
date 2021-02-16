package org.hackbrooklyn.plaza.util;

import lombok.extern.slf4j.Slf4j;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Slf4j
public class GeneralUtils {

    private static final Set<String> BROOKLYN_COLLEGE_EMAIL_DOMAINS = new HashSet<>(Arrays.asList(
            "bcmail.cuny.edu",  // New BC student email
            "bcmail.brooklyn.cuny.edu",  // Old BC student email
            "brooklyn.cuny.edu",  // General BC email
            "sci.brooklyn.cuny.edu"  // Department BC email
    ));

    /**
     * Checks if an email is a Brooklyn College email by comparing the domain with a list of manually verified domains.
     *
     * @param email The email to check.
     * @return Whether or not the email is a Brooklyn College email.
     */
    public static boolean checkIsBrooklynCollegeEmail(String email) {
        if (email != null) {
            String domain = email.substring(email.lastIndexOf("@") + 1);
            return BROOKLYN_COLLEGE_EMAIL_DOMAINS.contains(domain);
        } else {
            return false;
        }
    }
}
