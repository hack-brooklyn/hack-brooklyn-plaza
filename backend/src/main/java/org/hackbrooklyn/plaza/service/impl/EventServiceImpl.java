package org.hackbrooklyn.plaza.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.SaveEventDTO;
import org.hackbrooklyn.plaza.exception.EventNotFoundException;
import org.hackbrooklyn.plaza.model.Event;
import org.hackbrooklyn.plaza.repository.EventRepository;
import org.hackbrooklyn.plaza.service.EventService;
import org.hackbrooklyn.plaza.util.PushNotificationUtils;
import org.hackbrooklyn.plaza.util.SendEventPushNotificationsTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.Collection;
import java.util.Timer;

@Slf4j
@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final PushNotificationUtils pushNotificationUtils;

    @Autowired
    public EventServiceImpl(EventRepository eventRepository, PushNotificationUtils pushNotificationUtils) {
        this.eventRepository = eventRepository;
        this.pushNotificationUtils = pushNotificationUtils;
    }

    @Override
    public Collection<Event> getMultipleEvents() {
        return eventRepository.findAll();
    }

    @Override
    public Event getEventById(int eventId) {
        return eventRepository.findById(eventId).orElseThrow(EventNotFoundException::new);
    }

    @Override
    public int createNewEvent(SaveEventDTO reqBody) {
        Event event = new Event();
        event.setDescription(reqBody.getDescription());
        event.setTitle(reqBody.getTitle());
        event.setExternalLink(reqBody.getExternalLink());
        event.setStartTime(reqBody.getStartTime());
        event.setEndTime(reqBody.getEndTime());
        event.setPresenters(reqBody.getPresenters());
        Event newEvent = eventRepository.save(event);

        try {
            scheduleEventPushNotification(event);
        } catch (Exception e) {
            log.warn(String.format("Unable to schedule push notification for new event with ID: %s", newEvent.getId()));
            e.printStackTrace();
        }

        return newEvent.getId();
    }

    @Override
    public void updateEvent(int id, SaveEventDTO reqBody) {
        Event event = eventRepository.findById(id).orElseThrow(EventNotFoundException::new);
        event.setDescription(reqBody.getDescription());
        event.setTitle(reqBody.getTitle());
        event.setExternalLink(reqBody.getExternalLink());
        event.setStartTime(reqBody.getStartTime());
        event.setEndTime(reqBody.getEndTime());
        event.setPresenters(reqBody.getPresenters());
        eventRepository.save(event);

        try {
            scheduleEventPushNotification(event);
        } catch (Exception e) {
            log.warn(String.format("Unable to schedule push notification for edited event with ID: %s", event.getId()));
            e.printStackTrace();
        }
    }

    @Override
    public void deleteEvent(int id) {
        Event event = eventRepository.findById(id).orElseThrow(EventNotFoundException::new);
        eventRepository.delete(event);
    }

    private void scheduleEventPushNotification(Event event) {
        long currentTimeMs = System.currentTimeMillis();
        long eventStartTimeMs = event.getStartTime().atZone(ZoneId.of("UTC")).toInstant().toEpochMilli();

        if (eventStartTimeMs > currentTimeMs) {
            log.warn(String.format("Scheduling a push notification for event ID: %s", event.getId()));
            new Timer().schedule(
                    new SendEventPushNotificationsTask(event, pushNotificationUtils, eventRepository),
                    eventStartTimeMs - currentTimeMs
            );
        }
    }
}
