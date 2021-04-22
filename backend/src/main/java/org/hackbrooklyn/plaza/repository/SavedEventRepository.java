package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.Event;
import org.hackbrooklyn.plaza.model.SavedEvent;
import org.hackbrooklyn.plaza.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;

public interface SavedEventRepository extends JpaRepository<SavedEvent, Integer> {

    Collection<EventsOnly> findAllByUser(User user);

    Collection<UsersOnly> findAllByEvent(Event event);

    Optional<SavedEvent> findByEventAndUser(Event event, User user);

    void deleteAllByEvent(Event event);

    interface EventsOnly {
        Event getEvent();
    }

    interface UsersOnly {
        User getUser();
    }

}
