package org.hackbrooklyn.plaza.util;

public class TeamFormationUtils {

    // Replace everything that isn't a letter or a hyphen with a hyphen and convert to lowercase.
    public static String cleanTopicOrSkillName(String originalName) {
        return originalName
                .replaceAll("[^a-zA-Z-]", "-")
                .toLowerCase();
    }
}
