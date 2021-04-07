package org.hackbrooklyn.plaza.service.impl;

import org.hackbrooklyn.plaza.dto.SaveEventDTO;
import org.hackbrooklyn.plaza.exception.EventNotFoundException;
import org.hackbrooklyn.plaza.model.Event;
import org.hackbrooklyn.plaza.repository.EventRepository;
import org.hackbrooklyn.plaza.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    @Autowired
    public EventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
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
    }

    @Override
    public void deleteEvent(int id) {
        Event event = eventRepository.findById(id).orElseThrow(EventNotFoundException::new);
        eventRepository.delete(event);
    }


}
