import { History, LocationState } from 'history';

import store from 'store';
import { refreshAccessToken } from 'util/auth';
import { API_ROOT } from 'index';
import {
  ConnectionError,
  InvalidSubmittedDataError,
  NoPermissionError,
  TeamFormationParticipant,
  UnknownError
} from 'types';

export const checkParticipantHasTeam = async (history: History<LocationState>, overriddenAccessToken?: string) => {
  const state = store.getState();
  const accessToken = state.auth.jwtAccessToken;
  const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

  let res;
  try {
    res = await fetch(`${API_ROOT}/teamFormation/participants/userData`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (err) {
    throw new ConnectionError();
  }

  if (res.status === 200) {
    const resBody: TeamFormationParticipant = await res.json();
    return resBody.team !== null;
  } else if (res.status === 404) {
    history.push('/teamformation');
  } else if (res.status === 400) {
    throw new InvalidSubmittedDataError();
  } else if (res.status === 401) {
    const refreshedToken = await refreshAccessToken(history);
    await checkParticipantHasTeam(history, refreshedToken);
  } else if (res.status === 403) {
    history.push('/');
    throw new NoPermissionError();
  } else {
    throw new UnknownError();
  }
};
