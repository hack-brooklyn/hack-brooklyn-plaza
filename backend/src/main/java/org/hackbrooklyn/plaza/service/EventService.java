package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.dto.SaveEventDTO;
import org.hackbrooklyn.plaza.model.Event;

import java.util.Collection;

public interface EventService {

    Collection<Event> getMultipleEvents();

    Event getEventById(int eventId);

    int createNewEvent(SaveEventDTO reqBody);

    void updateEvent(int id, SaveEventDTO reqBody);

    void deleteEvent(int id);

}
