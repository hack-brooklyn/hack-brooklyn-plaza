package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.model.Announcement;

import java.util.Collection;

public interface AnnouncementService {

    Collection<Announcement> getMultipleAnnouncements(int page, int limit, String searchQuery);

}
