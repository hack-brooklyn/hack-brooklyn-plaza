import { History, LocationState } from 'history';

import store from 'store';
import { refreshAccessToken } from 'util/auth';
import { API_ROOT } from 'index';
import {
  ConnectionError,
  NoPermissionError,
  TeamFormationParticipant,
  TeamFormationParticipantNotInTeamError,
  TeamFormationParticipantNotSetUpError,
  TeamFormationTeam,
  UnknownError
} from 'types';

export const getParticipantData = async (
  history: History<LocationState>,
  overriddenAccessToken?: string
): Promise<TeamFormationParticipant> => {
  const state = store.getState();
  const accessToken = state.auth.jwtAccessToken;
  const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

  let res;
  try {
    res = await fetch(`${API_ROOT}/teamFormation/participants/currentUser`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (err) {
    throw new ConnectionError();
  }

  if (res.status === 200) {
    return await res.json();
  } else if (res.status === 404) {
    history.push('/teamformation');
    throw new TeamFormationParticipantNotSetUpError();
  } else if (res.status === 401) {
    const refreshedToken = await refreshAccessToken(history);
    await getParticipantData(history, refreshedToken);
  } else if (res.status === 403) {
    history.push('/');
    throw new NoPermissionError();
  }

  // The function must return a TeamFormationParticipant, otherwise throw an error
  throw new UnknownError();
};

export const getTeamData = async (
  history: History<LocationState>,
  overriddenAccessToken?: string
): Promise<TeamFormationTeam> => {
  const state = store.getState();
  const accessToken = state.auth.jwtAccessToken;
  const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

  let res;
  try {
    res = await fetch(`${API_ROOT}/teamFormation/teams/currentUser`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (err) {
    throw new ConnectionError();
  }

  if (res.status === 200) {
    return await res.json();
  } else if (res.status === 404) {
    history.push('/teamformation');
    throw new TeamFormationParticipantNotInTeamError();
  } else if (res.status === 401) {
    const refreshedToken = await refreshAccessToken(history);
    await getTeamData(history, refreshedToken);
  } else if (res.status === 403) {
    history.push('/');
    throw new NoPermissionError();
  }

  // The function must return a TeamFormationTeam, otherwise throw an error
  throw new UnknownError();
};

export const validateTopicsAndSkills = (topicsAndSkills: string[]): void => {
  if (topicsAndSkills.length < 1 || topicsAndSkills.length > 5) {
    throw new Error('Please select 1 to 5 topics to continue.');
  }
};
