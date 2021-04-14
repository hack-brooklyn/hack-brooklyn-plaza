package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.dto.SubscribeToPushNotificationDTO;
import org.hackbrooklyn.plaza.model.User;

public interface PushNotificationService {

    void subscribe(SubscribeToPushNotificationDTO requestData, User user);

    void unsubscribe(User user);
}
