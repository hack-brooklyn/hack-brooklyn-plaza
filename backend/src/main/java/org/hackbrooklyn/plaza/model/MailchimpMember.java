package org.hackbrooklyn.plaza.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import java.util.Map;

/**
 * Represents the parts that we need from Mailchimp's "List Member" object from their API.
 */
@Data
@NoArgsConstructor
@RequiredArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MailchimpMember {

    @NonNull
    @JsonProperty("email_address")
    private String emailAddress;

    @NonNull
    private String status;

    @NonNull
    @JsonProperty("merge_fields")
    private Map<String, String> mergeFields;

    @NonNull
    private String[] tags;
}
