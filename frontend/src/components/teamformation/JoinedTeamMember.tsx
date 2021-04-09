import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

import { handleError } from 'util/plazaUtils';
import { refreshAccessToken } from 'util/auth';
import { refreshHeadingSectionData } from 'actions/teamFormation';
import { API_ROOT } from 'index';
import {
  ConnectionError,
  InvalidSubmittedDataError,
  NoPermissionError,
  RootState,
  TeamFormationParticipant,
  TeamFormationParticipantNotInTeamError,
  UnknownError
} from 'types';

import profileImage from 'assets/icons/profile.svg';
import leaderIcon from 'assets/icons/team-formation/leader.svg';

interface JoinedTeamMemberProps {
  teamMemberData: TeamFormationParticipant;
  currentParticipantData: TeamFormationParticipant;
  leaderId: number;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const JoinedTeamMember = (props: JoinedTeamMemberProps): JSX.Element => {
  const { teamMemberData, currentParticipantData, leaderId, setShow } = props;

  return (
    <JoinedTeamMemberCard>
      <JoinedTeamMemberContents
        teamMemberData={teamMemberData}
        currentParticipantData={currentParticipantData}
        leaderId={leaderId}
        setShow={setShow}
      />
    </JoinedTeamMemberCard>
  );
};

export const JoinedTeamMemberContents = (
  props: JoinedTeamMemberProps
): JSX.Element => {
  const { teamMemberData, currentParticipantData, leaderId, setShow } = props;

  const dispatch = useDispatch();
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const removeTeamMember = async (participantId: number) => {
    try {
      await sendRemoveMemberRequest(participantId);
    } catch (err) {
      handleError(err);
    }
  };

  const sendRemoveMemberRequest = async (
    participantId: number,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    const resBody = {
      participantId: participantId
    };

    let res;
    try {
      res = await fetch(
        `${API_ROOT}/teamFormation/teams/currentUser/removeMember`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(resBody)
        }
      );
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      toast.success('The member has been removed from the team.');
      dispatch(refreshHeadingSectionData());
      setShow(false);
    } else if (res.status === 404) {
      throw new TeamFormationParticipantNotInTeamError();
    } else if (res.status === 400) {
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await sendRemoveMemberRequest(participantId, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <>
      <MainContents>
        <JoinedTeamMemberImage
          src={profileImage}
          alt={`${teamMemberData.user.firstName} ${teamMemberData.user.lastName}`}
        />

        <div>
          <JoinedTeamMemberName>
            {teamMemberData.user.firstName} {teamMemberData.user.lastName}
          </JoinedTeamMemberName>
          <JoinedTeamMemberSpecialization>
            {teamMemberData.specialization}
          </JoinedTeamMemberSpecialization>
        </div>
      </MainContents>

      <div>
        {teamMemberData.id === leaderId ? (
          <LeaderIcon src={leaderIcon} alt="Team Leader" />
        ) : (
          <>
            {currentParticipantData.id === leaderId ? (
              <Button
                variant="danger"
                onClick={async () => {
                  if (confirm('Are you sure you want to remove this member?')) {
                    await removeTeamMember(teamMemberData.id);
                  }
                }}
              >
                Remove
              </Button>
            ) : null}
          </>
        )}
      </div>
    </>
  );
};

const JoinedTeamMemberCard = styled.article`
  margin: 1.5rem 0;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
`;

const MainContents = styled.div`
  display: flex;
  align-items: center;
`;

const JoinedTeamMemberImage = styled.img`
  height: 4rem;
  width: 4rem;
  margin-right: 1.5rem;
`;

const LeaderIcon = styled.img`
  height: 2rem;
  width: 2rem;
`;

const JoinedTeamMemberName = styled.div`
  font-weight: bold;
  font-size: 1.25rem;
`;

const JoinedTeamMemberSpecialization = styled.div`
  font-size: 1.1rem;
`;

export default JoinedTeamMember;
