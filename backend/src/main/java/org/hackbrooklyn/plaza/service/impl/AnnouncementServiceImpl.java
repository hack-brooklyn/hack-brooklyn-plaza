package org.hackbrooklyn.plaza.service.impl;

import org.hackbrooklyn.plaza.model.Announcement;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.repository.AnnouncementRepository;
import org.hackbrooklyn.plaza.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import java.time.LocalDateTime;
import java.util.Collection;

@Service
public class AnnouncementServiceImpl implements AnnouncementService {

    private final EntityManager entityManager;
    private AnnouncementRepository announcementRepository;

    @Autowired
    public AnnouncementServiceImpl(EntityManager entityManager, AnnouncementRepository announcementRepository) {
        this.entityManager = entityManager;
        this.announcementRepository = announcementRepository;
    }

    @Override
    public Collection<Announcement> getMultipleAnnouncements(int page, int limit) {

        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Announcement> criteriaQuery = criteriaBuilder.createQuery(Announcement.class);
        Root<Announcement> from = criteriaQuery.from(Announcement.class);
        CriteriaQuery<Announcement> select = criteriaQuery.select(from);
        CriteriaQuery<Announcement> sorted = select.orderBy(criteriaBuilder.desc(from.get("lastUpdated")));
        TypedQuery<Announcement> typedQuery = entityManager.createQuery(sorted);
        typedQuery.setFirstResult((page - 1) * limit);
        typedQuery.setMaxResults(limit);

        return typedQuery.getResultList();
    }

    @Override
    public int createNewAnnouncement(String body, User author) {
        Announcement announcement = new Announcement();
        announcement.setBody(body);
        announcement.setAuthor(author);
        Announcement newAnnouncement = announcementRepository.save(announcement);

        return newAnnouncement.getId();

    }

    @Override
    public int updateAnnouncement(int id, String body) {
        Announcement announcement = announcementRepository.getOne(id);
        announcement.setBody(body);
        announcement.setLastUpdated(LocalDateTime.now());
        announcementRepository.save(announcement);

        return announcement.getId();
    }
}
