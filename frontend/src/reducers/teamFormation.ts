import { TeamFormationActionTypes, TeamFormationState } from 'types';

export const initialTeamFormationState: TeamFormationState = {
  toggleHeadingSectionDataRefresh: false
};

const userReducer = (
  state = initialTeamFormationState,
  action: TeamFormationActionTypes
): TeamFormationState => {
  switch (action.type) {
    case 'REFRESH_HEADING_SECTION_DATA':
      return {
        toggleHeadingSectionDataRefresh: !state.toggleHeadingSectionDataRefresh
      };

    default:
      return state;
  }
};

export default userReducer;
