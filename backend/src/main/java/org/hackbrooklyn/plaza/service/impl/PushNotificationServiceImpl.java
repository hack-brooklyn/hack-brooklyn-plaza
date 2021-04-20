package org.hackbrooklyn.plaza.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.SubscribeToPushNotificationDTO;
import org.hackbrooklyn.plaza.exception.ClientAlreadySubscribedException;
import org.hackbrooklyn.plaza.model.Event;
import org.hackbrooklyn.plaza.model.PushNotificationSubscription;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.repository.EventRepository;
import org.hackbrooklyn.plaza.repository.PushNotificationSubscriptionRepository;
import org.hackbrooklyn.plaza.service.PushNotificationService;
import org.hackbrooklyn.plaza.util.PushNotificationUtils;
import org.hackbrooklyn.plaza.util.SendEventPushNotificationsTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.Timer;

@Slf4j
@Service
public class PushNotificationServiceImpl implements PushNotificationService {

    private final PushNotificationSubscriptionRepository pushNotificationSubscriptionRepository;
    private final EventRepository eventRepository;
    private final PushNotificationUtils pushNotificationUtils;

    @Autowired
    public PushNotificationServiceImpl(PushNotificationSubscriptionRepository pushNotificationSubscriptionRepository, EventRepository eventRepository, PushNotificationUtils pushNotificationUtils) {
        this.pushNotificationSubscriptionRepository = pushNotificationSubscriptionRepository;
        this.eventRepository = eventRepository;
        this.pushNotificationUtils = pushNotificationUtils;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initializeEventPushNotifications() {
        List<Event> events = eventRepository.findAll();

        int totalScheduledEvents = 0;
        for (Event event : events) {
            long currentTimeMs = System.currentTimeMillis();
            long eventStartTimeMs = event.getStartTime().atZone(ZoneId.of("UTC")).toInstant().toEpochMilli();

            if (eventStartTimeMs > currentTimeMs) {
                totalScheduledEvents++;
                new Timer().schedule(
                        new SendEventPushNotificationsTask(event, pushNotificationUtils, eventRepository),
                        eventStartTimeMs - currentTimeMs
                );
            }
        }

        log.info(String.format("Scheduled %s events for push notifications.", totalScheduledEvents));
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
