import { toast } from 'react-toastify';
import { encode } from 'base64-arraybuffer';

import store from 'store';
import { refreshAccessToken } from 'util/auth';
import { API_ROOT, VAPID_PUBLIC_KEY } from 'index';
import {
  Breakpoints,
  ConnectionError,
  NoPermissionError,
  UnknownError
} from 'types';

export const subscribeToPushNotifications = async (): Promise<void> => {
  if ('Notification' in window && 'PushManager' in window) {
    await Notification.requestPermission();

    if (Notification.permission === 'granted') {
      // Register the subscription and send to backend
      const serviceWorker = await navigator.serviceWorker.ready;
      const existingSubscription = await serviceWorker.pushManager.getSubscription();

      if (existingSubscription === null) {
        const pushSubscription = await serviceWorker.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC_KEY
        });

        const state = store.getState();
        try {
          await sendSubscriptionRequest(pushSubscription);
          localStorage.setItem(
            'isNotificationPromptClosed',
            JSON.stringify(true)
          );
          toast.success(
            'Push notifications have been enabled! You will receive updates about Hack Brooklyn even while Hack Brooklyn Plaza is closed.',
            {
              position:
                state.app.windowWidth < Breakpoints.Medium
                  ? 'bottom-center'
                  : 'top-left'
            }
          );
        } catch (err) {
          toast.error(
            'An error occurred while trying to subscribe your browser for push notifications! Please try refreshing the page or come back later and try again.',
            {
              position:
                state.app.windowWidth < Breakpoints.Medium
                  ? 'bottom-center'
                  : 'top-left'
            }
          );
          console.error(err);
        }
      }
    }
  } else {
    console.log('Your browser does not support push notifications.');
  }
};

const sendSubscriptionRequest = async (
  subscription: PushSubscription,
  overriddenAccessToken?: string
) => {
  const state = store.getState();
  const accessToken = state.auth.jwtAccessToken;
  const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

  const subscriptionKey = subscription.getKey
    ? subscription.getKey('p256dh')
    : '';
  const subscriptionAuth = subscription.getKey
    ? subscription.getKey('auth')
    : '';

  const reqBody = {
    endpoint: subscription.endpoint,
    key: subscriptionKey ? encode(subscriptionKey) : '',
    auth: subscriptionAuth ? encode(subscriptionAuth) : ''
  };

  let res;
  try {
    res = await fetch(`${API_ROOT}/pushNotifications/subscribe`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqBody)
    });
  } catch (err) {
    throw new ConnectionError();
  }

  if (res.status === 200 || res.status === 409) {
    // The client has been successfully subscribed or is already subscribed
    return;
  } else if (res.status === 401) {
    const refreshedToken = await refreshAccessToken();
    await sendSubscriptionRequest(subscription, refreshedToken);
  } else if (res.status === 403) {
    throw new NoPermissionError();
  } else {
    throw new UnknownError();
  }
};
