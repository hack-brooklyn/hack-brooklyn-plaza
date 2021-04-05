package org.hackbrooklyn.plaza.service.impl;

import org.hackbrooklyn.plaza.exception.AnnouncementNotFoundException;
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
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.time.LocalDateTime;
import java.util.Collection;

@Service
public class AnnouncementServiceImpl implements AnnouncementService {

    private final EntityManager entityManager;
    private final AnnouncementRepository announcementRepository;

    @Autowired
    public AnnouncementServiceImpl(EntityManager entityManager, AnnouncementRepository announcementRepository) {
        this.entityManager = entityManager;
        this.announcementRepository = announcementRepository;
    }

    @Override
    public Collection<Announcement> getMultipleAnnouncements(boolean participant, int page, int limit) {

        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Announcement> criteriaQuery = criteriaBuilder.createQuery(Announcement.class);
        Root<Announcement> from = criteriaQuery.from(Announcement.class);
        CriteriaQuery<Announcement> select = criteriaQuery.select(from);

        Predicate participantOnlyPredicate = criteriaBuilder.equal(from.get("participantsOnly"), participant);
        CriteriaQuery<Announcement> filter = participant ? select : select.where(participantOnlyPredicate);

        CriteriaQuery<Announcement> sorted = filter.orderBy(criteriaBuilder.desc(from.get("lastUpdated")));
        TypedQuery<Announcement> typedQuery = entityManager.createQuery(sorted);
        typedQuery.setFirstResult((page - 1) * limit);
        typedQuery.setMaxResults(limit);

        return typedQuery.getResultList();
    }

    @Override
    public Announcement getAnnouncementById(boolean participant, int announcementId) {
        return announcementRepository.findById(announcementId).orElseThrow(AnnouncementNotFoundException::new);
    }

    @Override
    public int createNewAnnouncement(String body, boolean participantsOnly, User author) {
        Announcement announcement = new Announcement();
        LocalDateTime time = LocalDateTime.now();
        announcement.setBody(body);
        announcement.setAuthor(author);
        announcement.setTimeCreated(time);
        announcement.setLastUpdated(time);
        announcement.setParticipantsOnly(participantsOnly);
        Announcement newAnnouncement = announcementRepository.save(announcement);

        return newAnnouncement.getId();
    }

    @Override
    public void updateAnnouncement(int id, String body, boolean participantsOnly) {
        Announcement announcement = announcementRepository.getOne(id);
        announcement.setBody(body);
        announcement.setParticipantsOnly(participantsOnly);
        announcement.setLastUpdated(LocalDateTime.now());
        announcementRepository.save(announcement);
    }

    @Override
    public void deleteAnnouncement(int id) {
        Announcement announcement = announcementRepository.getOne(id);
        announcementRepository.delete(announcement);
    }

}
