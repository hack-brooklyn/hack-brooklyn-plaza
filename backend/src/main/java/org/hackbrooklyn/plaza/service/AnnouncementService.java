package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.model.Announcement;
import org.hackbrooklyn.plaza.model.User;

import java.util.Collection;

public interface AnnouncementService {

    Collection<Announcement> getMultipleAnnouncements(int page, int limit);

    int createNewAnnouncement(String body, User author);

}
