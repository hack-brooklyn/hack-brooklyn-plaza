package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.dto.SaveEventDTO;
import org.hackbrooklyn.plaza.model.Event;
import org.hackbrooklyn.plaza.model.User;

import java.util.Collection;

public interface EventService {

    Collection<Event> getMultipleEvents();

    Collection<Integer> getFollowedEventIds(User user);

    Collection<User> getUsersFollowing(int eventId);

    Event getEventById(int eventId);

    int createNewEvent(SaveEventDTO reqBody);

    void updateEvent(int id, SaveEventDTO reqBody);

    void deleteEvent(int id);

    void saveEvent(int id, User user);

    void unsaveEvent(int eventId, User user);

}
