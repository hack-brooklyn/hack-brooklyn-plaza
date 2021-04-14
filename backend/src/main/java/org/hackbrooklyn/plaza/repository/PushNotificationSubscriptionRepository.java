package org.hackbrooklyn.plaza.repository;

import org.hackbrooklyn.plaza.model.PushNotificationSubscription;
import org.hackbrooklyn.plaza.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushNotificationSubscriptionRepository extends JpaRepository<PushNotificationSubscription, Integer> {

    Optional<List<PushNotificationSubscription>> findAllBySubscribedUser(User subscribedUser);

    Optional<PushNotificationSubscription> findFirstBySubscribedUserAndEndpointAndKeyAndAuth(User subscribedUser, String endpoint, String key, String auth);

    @Transactional
    void deleteAllBySubscribedUser(User subscribedUser);
}
