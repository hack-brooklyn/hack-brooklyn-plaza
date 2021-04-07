package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {

}
