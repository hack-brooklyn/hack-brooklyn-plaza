package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.model.Announcement;
import org.hackbrooklyn.plaza.model.User;

import java.util.Collection;

public interface AnnouncementService {

    Collection<Announcement> getMultipleAnnouncements(boolean participant, int page, int limit);

    int createNewAnnouncement(String body, boolean participantsOnly, User author);

    void updateAnnouncement(int id, String body, boolean participantsOnly);

    void deleteAnnouncement(int id);

}
