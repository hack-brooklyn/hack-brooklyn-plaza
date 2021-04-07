import { REFRESH_HEADING_SECTION_DATA } from '../constants';
import { TeamFormationActionTypes } from 'types';

// Dispatch this to toggle the heading useEffect to refresh data
export const refreshHeadingSectionData = (): TeamFormationActionTypes => {
  return {
    type: REFRESH_HEADING_SECTION_DATA
  };
};
