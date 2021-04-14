package org.hackbrooklyn.plaza.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.hackbrooklyn.plaza.dto.NotificationContentDTO;
import org.hackbrooklyn.plaza.exception.UserNotFoundException;
import org.hackbrooklyn.plaza.model.PushNotificationSubscription;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.repository.PushNotificationSubscriptionRepository;
import org.jose4j.lang.JoseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Slf4j
@Component
public class PushNotificationUtils {

    private final PushNotificationSubscriptionRepository pushNotificationSubscriptionRepository;
    private final PushService pushService;
    private final ObjectMapper objectMapper;

    @Autowired
    public PushNotificationUtils(PushNotificationSubscriptionRepository pushNotificationSubscriptionRepository, PushService pushService, ObjectMapper objectMapper) {
        this.pushNotificationSubscriptionRepository = pushNotificationSubscriptionRepository;
        this.pushService = pushService;
        this.objectMapper = objectMapper;
    }

    /**
     * Sends a push notification to a specific subscription.
     *
     * @param subscription The subscription to send the notification to.
     * @param payload      The notification's payload in bytes.
     */
    public void sendPushNotificationToSubscription(PushNotificationSubscription subscription, byte[] payload) throws GeneralSecurityException, JoseException, IOException, ExecutionException, InterruptedException {
        Notification notification = new Notification(
                subscription.getEndpoint(),
                subscription.getUserPublicKey(),
                subscription.getAuthAsBytes(),
                payload
        );

        pushService.send(notification);
    }

    /**
     * Sends a push notification to all of the subscriptions associated with a user.
     *
     * @param user    The user to send the notification to.
     * @param payload The notification's payload in bytes.
     */
    public void sendPushNotificationToUser(User user, byte[] payload) throws GeneralSecurityException, JoseException, IOException, ExecutionException, InterruptedException {
        List<PushNotificationSubscription> subscriptions = pushNotificationSubscriptionRepository
                .findAllBySubscribedUser(user)
                .orElseThrow(UserNotFoundException::new);

        for (PushNotificationSubscription subscription : subscriptions) {
            sendPushNotificationToSubscription(subscription, payload);
        }
    }

    /**
     * Sends a push notification to all saved subscriptions in the database.
     *
     * @param payload The notification's payload in bytes.
     */
    public void sendPushNotificationToAllSubscribers(byte[] payload) {
        List<PushNotificationSubscription> subscriptions = pushNotificationSubscriptionRepository.findAll();

        for (PushNotificationSubscription subscription : subscriptions) {
            try {
                sendPushNotificationToSubscription(subscription, payload);
            } catch (Exception e) {
                log.warn(String.format("Could not send push notification for subscription ID: %s.",
                        subscription.getId()));
                e.printStackTrace();
            }
        }
    }

    /**
     * A simplified way to send a push notification to all subscribers in a separate thread.
     *
     * @param notificationContent The notification's content to send.
     */
    public void sendBackgroundSimplePushNotificationToAllSubscribers(NotificationContentDTO notificationContent) {
        new Thread(() -> {
            try {
                sendPushNotificationToAllSubscribers(objectMapper.writeValueAsBytes(notificationContent));
            } catch (Exception e) {
                log.warn("Could not send simple push notification to all subscribers.");
                e.printStackTrace();
            }
        }).start();
    }

    /**
     * A simplified way to send a push notification to a specific user in a separate thread.
     *
     * @param user THe user to send the notification to.
     * @param notificationContent The notification's content to send.
     */
    public void sendBackgroundSimplePushNotificationToUser(User user, NotificationContentDTO notificationContent) {
        new Thread(() -> {
            try {
                sendPushNotificationToUser(user, objectMapper.writeValueAsBytes(notificationContent));
            } catch (Exception e) {
                log.warn(String.format("Could not send simple push notification to user with ID: %s", user.getId()));
                e.printStackTrace();
            }
        }).start();
    }

    /**
     * A simplified way to send a push notification to a collection of users in a separate thread.
     *
     * @param users The collection of users to send the notification to.
     * @param notificationContent The notification's content to send.
     */
    public void sendBackgroundSimplePushNotificationToUsers(
            Collection<User> users,
            NotificationContentDTO notificationContent
    ) {
        new Thread(() -> {
            try {
                for (User user : users) {
                    sendBackgroundSimplePushNotificationToUser(user, notificationContent);
                }
            } catch (Exception e) {
                log.warn("Could not send simple push notification to users.");
                e.printStackTrace();
            }
        }).start();
    }
}
