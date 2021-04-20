package org.hackbrooklyn.plaza.util;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.NotificationContentDTO;
import org.hackbrooklyn.plaza.model.Event;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.repository.EventRepository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.TimerTask;

@Slf4j
@AllArgsConstructor
public class SendEventPushNotificationsTask extends TimerTask {

    private final Event event;
    private final PushNotificationUtils pushNotificationUtils;
    private final EventRepository eventRepository;

    @Override
    public void run() {
        // Check to see if the scheduled notification's event is still current
        // Also retrieves the most up-to-date version of the event's data
        final Event currentEventData;
        try {
            currentEventData = eventRepository
                    .findById(event.getId())
                    .orElseThrow(Exception::new);
        } catch (Exception e) {
            e.printStackTrace();
            return;
        }

        if (!event.getStartTime().equals(currentEventData.getStartTime())) {
            log.warn(String.format(
                    "A previously scheduled push notification with event ID %s has differing start times from the " +
                            "newly fetched event data found in the database, likely due to the event being edited. " +
                            "This scheduled push notification will not be sent.",
                    currentEventData.getId())
            );
            return;
        }

        // The event's start time is good, send the push notification with the updated event data
        log.info(String.format("Sending push notifications for event ID: %s", currentEventData.getId()));
        NotificationContentDTO notification = new NotificationContentDTO(
                String.format("\"%s\" is starting now!", currentEventData.getTitle()),
                currentEventData.getDescription(),
                String.format("event-reminder-%s", currentEventData.getId()),
                true,
                false
        );

        // TODO: Get a list of users that saved this event and send them the push notification
        Collection<User> savedEventUsers = new ArrayList<>();
        pushNotificationUtils.sendBackgroundSimplePushNotificationToUsers(savedEventUsers, notification);
    }
}
