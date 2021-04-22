package org.hackbrooklyn.plaza.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.hackbrooklyn.plaza.dto.SaveEventDTO;
import org.hackbrooklyn.plaza.exception.EventNotFoundException;
import org.hackbrooklyn.plaza.model.Event;
import org.hackbrooklyn.plaza.model.SavedEvent;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.repository.EventRepository;
import org.hackbrooklyn.plaza.repository.SavedEventRepository;
import org.hackbrooklyn.plaza.repository.SavedEventRepository.UsersOnly;
import org.hackbrooklyn.plaza.service.EventService;
import org.hackbrooklyn.plaza.util.PushNotificationUtils;
import org.hackbrooklyn.plaza.util.SendEventPushNotificationsTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import javax.transaction.Transactional;
import java.time.ZoneId;
import java.util.Collection;
import java.util.Timer;
import java.util.stream.Collectors;

import static org.hackbrooklyn.plaza.repository.SavedEventRepository.EventsOnly;

@Slf4j
@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final PushNotificationUtils pushNotificationUtils;
    private final SavedEventRepository savedEventRepository;
    private final EntityManager entityManager;

    @Autowired
    public EventServiceImpl(EventRepository eventRepository, PushNotificationUtils pushNotificationUtils, SavedEventRepository savedEventRepository, EntityManager entityManager) {
        this.eventRepository = eventRepository;
        this.pushNotificationUtils = pushNotificationUtils;
        this.savedEventRepository = savedEventRepository;
        this.entityManager = entityManager;
    }

    @Override
    public Collection<Event> getMultipleEvents() {

        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Event> criteriaQuery = criteriaBuilder.createQuery(Event.class);
        Root<Event> from = criteriaQuery.from(Event.class);
        CriteriaQuery<Event> select = criteriaQuery.select(from);

        CriteriaQuery<Event> sorted = select.orderBy(criteriaBuilder.asc(from.get("startTime")));
        TypedQuery<Event> typedQuery = entityManager.createQuery(sorted);

        return typedQuery.getResultList();
    }

    @Override
    public Collection<Integer> getFollowedEventIds(User user) {
        Collection<EventsOnly> idsProjection = savedEventRepository.findAllByUser(user);
        return idsProjection.stream()
                .map(EventsOnly::getEvent)
                .map(Event::getId)
                .collect(Collectors.toList());
    }

    @Override
    public Collection<User> getUsersFollowing(int eventId) {
        Event event = eventRepository
                .findById(eventId)
                .orElseThrow(EventNotFoundException::new);

        Collection<UsersOnly> usersProjection = savedEventRepository.findAllByEvent(event);
        return usersProjection.stream()
                .map(UsersOnly::getUser)
                .collect(Collectors.toList());
    }

    @Override
    public Event getEventById(int eventId) {
        return eventRepository
                .findById(eventId)
                .orElseThrow(EventNotFoundException::new);
    }

    @Override
    public int createNewEvent(SaveEventDTO reqBody) {
        Event event = new Event();
        event.setDescription(reqBody.getDescription());
        event.setTitle(reqBody.getTitle());
        event.setExternalLink(reqBody.getExternalLink());
        event.setStartTime(reqBody.getStartTime());
        event.setEndTime(reqBody.getEndTime());
        event.setPresenter(reqBody.getPresenter());
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
        Event event = eventRepository
                .findById(id)
                .orElseThrow(EventNotFoundException::new);

        event.setDescription(reqBody.getDescription());
        event.setTitle(reqBody.getTitle());
        event.setExternalLink(reqBody.getExternalLink());
        event.setStartTime(reqBody.getStartTime());
        event.setEndTime(reqBody.getEndTime());
        event.setPresenter(reqBody.getPresenter());
        eventRepository.save(event);

        try {
            scheduleEventPushNotification(event);
        } catch (Exception e) {
            log.warn(String.format("Unable to schedule push notification for edited event with ID: %s", event.getId()));
            e.printStackTrace();
        }
    }

    @Override
    @Transactional
    public void deleteEvent(int id) {
        Event event = eventRepository
                .findById(id)
                .orElseThrow(EventNotFoundException::new);

        savedEventRepository.deleteAllByEvent(event);
        eventRepository.delete(event);
    }

    @Override
    public void saveEvent(int id, User user) {
        Event event = eventRepository
                .findById(id)
                .orElseThrow(EventNotFoundException::new);

        SavedEvent savedEvent = new SavedEvent();
        savedEvent.setEvent(event);
        savedEvent.setUser(user);
        savedEventRepository.save(savedEvent);
    }

    @Override
    public void unsaveEvent(int eventId, User user) {
        Event event = eventRepository
                .findById(eventId)
                .orElseThrow(EventNotFoundException::new);

        SavedEvent savedEvent = savedEventRepository
                .findByEventAndUser(event, user)
                .orElseThrow(EventNotFoundException::new);

        savedEventRepository.delete(savedEvent);
    }

    private void scheduleEventPushNotification(Event event) {
        long currentTimeMs = System.currentTimeMillis();
        long eventStartTimeMs = event.getStartTime().atZone(ZoneId.of("UTC")).toInstant().toEpochMilli();

        if (eventStartTimeMs > currentTimeMs) {
            log.info(String.format("Scheduling a push notification for event ID: %s", event.getId()));
            new Timer().schedule(
                    new SendEventPushNotificationsTask(event, pushNotificationUtils, eventRepository, savedEventRepository),
                    eventStartTimeMs - currentTimeMs
            );
        }
    }
}
