package org.hackbrooklyn.plaza.service.impl;

import org.hackbrooklyn.plaza.dto.SubscribeToPushNotificationDTO;
import org.hackbrooklyn.plaza.exception.ClientAlreadySubscribedException;
import org.hackbrooklyn.plaza.model.PushNotificationSubscription;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.repository.PushNotificationSubscriptionRepository;
import org.hackbrooklyn.plaza.service.PushNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PushNotificationServiceImpl implements PushNotificationService {

    private final PushNotificationSubscriptionRepository pushNotificationSubscriptionRepository;

    @Autowired
    public PushNotificationServiceImpl(PushNotificationSubscriptionRepository pushNotificationSubscriptionRepository) {
        this.pushNotificationSubscriptionRepository = pushNotificationSubscriptionRepository;
    }

    @Override
    public void subscribe(SubscribeToPushNotificationDTO requestData, User user) {
        // Check for an already existing subscription
        Optional<PushNotificationSubscription> subscription =
                pushNotificationSubscriptionRepository.findFirstBySubscribedUserAndEndpointAndKeyAndAuth(
                        user, requestData.getEndpoint(), requestData.getKey(), requestData.getAuth()
                );

        if (subscription.isPresent()) {
            throw new ClientAlreadySubscribedException();
        }

        PushNotificationSubscription newSubscription = new PushNotificationSubscription();
        newSubscription.setSubscribedUser(user);
        newSubscription.setEndpoint(requestData.getEndpoint());
        newSubscription.setKey(requestData.getKey());
        newSubscription.setAuth(requestData.getAuth());

        pushNotificationSubscriptionRepository.save(newSubscription);
    }

    @Override
    public void unsubscribe(User user) {
        pushNotificationSubscriptionRepository.deleteAllBySubscribedUser(user);
    }
}
