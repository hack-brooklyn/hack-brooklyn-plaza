package org.hackbrooklyn.plaza.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.hackbrooklyn.plaza.dto.NewsletterSubscriptionDTO;

import java.security.NoSuchAlgorithmException;

public interface NewsletterService {

    void subscribeUser(NewsletterSubscriptionDTO subscriptionData) throws NoSuchAlgorithmException, JsonProcessingException;
}
