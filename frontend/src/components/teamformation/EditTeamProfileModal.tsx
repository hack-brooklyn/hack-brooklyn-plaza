import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import styled from 'styled-components/macro';
import { toast } from 'react-toastify';

import {
  ShowTeamOnBrowserCheckbox,
  TeamNameField,
  TeamObjectiveStatementField,
  TeamSizeField,
  TopicsAndSkillsSelect
} from 'components/teamformation/TeamFormationFormFields';
import { RequiredFormLabel } from 'components';
import {
  ModalBody,
  ModalCenteredButton,
  ModalHeadingNoMarginBottom,
  ModalSubheading,
  SlimModalDisplayText
} from 'common/styles/teamformation/teamFormationModalStyles';
import { CenteredButton } from 'common/styles/commonStyles';
import { refreshAccessToken } from 'util/auth';
import { getParticipantData, getTeamData } from 'util/teamFormation';
import { generateSelectOptions, handleError } from 'util/plazaUtils';
import { refreshHeadingSectionData } from 'actions/teamFormation';
import { topicsAndSkillsOptions } from 'common/selectOptions/topicsAndSkillsOptions';
import {
  CommonModalProps,
  ConnectionError,
  InvalidSubmittedDataError,
  NoPermissionError,
  RootState,
  TeamFormationParticipant,
  TeamFormationParticipantNotInTeamError,
  TeamFormationTeam,
  TeamFormationTeamFormDataWithBrowserVisibility,
  TeamFormationTeamNameConflictError,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';

import profileImage from 'assets/icons/profile.svg';
import leaderIcon from 'assets/icons/team-formation/leader.svg';
import Button from 'react-bootstrap/Button';

const EditTeamProfileModal = (props: CommonModalProps): JSX.Element => {
  const { show, setShow } = props;

  const dispatch = useDispatch();
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [
    participantData,
    setParticipantData
  ] = useState<TeamFormationParticipant | null>(null);
  const [teamData, setTeamData] = useState<TeamFormationTeam | null>(null);
  const [multiSelectOptions, setMultiSelectOptions] = useState([
    ...topicsAndSkillsOptions
  ]);
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    loadTeamProfileEditor().catch((err) => handleError(err));
  }, [show]);

  const loadTeamProfileEditor = async () => {
    if (show) {
      const retrievedParticipantData = await getParticipantData(history);
      setParticipantData(retrievedParticipantData);

      const retrievedTeamData = await getTeamData(history);
      setTeamData(retrievedTeamData);
      setMultiSelectOptions([
        ...topicsAndSkillsOptions,
        ...generateSelectOptions(retrievedTeamData.interestedTopicsAndSkills)
      ]);
      setFormLoaded(true);
    } else {
      // Reset state
      setTeamData(null);
      setMultiSelectOptions([...topicsAndSkillsOptions]);
      setFormLoaded(false);
    }
  };

  const updateTeamProfile = async (
    profileData: TeamFormationTeamFormDataWithBrowserVisibility,
    {
      setSubmitting
    }: FormikHelpers<TeamFormationTeamFormDataWithBrowserVisibility>
  ) => {
    try {
      if (teamData !== null && teamData.members.length > profileData.size) {
        toast.warn(
          'Your team size cannot be smaller than the number of members in your team.'
        );
        setSubmitting(false);
        return;
      }

      await sendUpdateTeamProfileRequest(profileData);
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const sendUpdateTeamProfileRequest = async (
    profileData: TeamFormationTeamFormDataWithBrowserVisibility,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/teams/currentUser`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      toast.success(`Your team's team formation profile has been updated!`);
      dispatch(refreshHeadingSectionData());
      setShow(false);
    } else if (res.status === 409) {
      throw new TeamFormationTeamNameConflictError();
    } else if (res.status === 404) {
      throw new TeamFormationParticipantNotInTeamError();
    } else if (res.status === 400) {
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await sendUpdateTeamProfileRequest(profileData, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const deleteTeam = async () => {
    try {
      await sendDeleteTeamRequest();
    } catch (err) {
      handleError(err);
    }
  };

  const sendDeleteTeamRequest = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/teams/currentUser`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      toast.success('Your team has been deleted.');
      dispatch(refreshHeadingSectionData());
      setShow(false);
    } else if (res.status === 404) {
      throw new TeamFormationParticipantNotInTeamError();
    } else if (res.status === 400) {
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await sendDeleteTeamRequest(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const leaveTeam = async () => {
    try {
      await sendLeaveTeamRequest();
    } catch (err) {
      handleError(err);
    }
  };

  const sendLeaveTeamRequest = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(
        `${API_ROOT}/teamFormation/teams/currentUser/leaveTeam`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      toast.success('You have left the team.');
      dispatch(refreshHeadingSectionData());
      setShow(false);
    } else if (res.status === 404) {
      throw new TeamFormationParticipantNotInTeamError();
    } else if (res.status === 400) {
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await sendLeaveTeamRequest(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <Modal
      show={show}
      size="lg"
      onHide={() => setShow(false)}
      dialogClassName="modal-fullscreen-lg-down"
      handleClose={() => setShow(false)}
    >
      <ModalBody>
        <ModalHeadingNoMarginBottom>
          Edit Team Profile
        </ModalHeadingNoMarginBottom>

        {show &&
          (formLoaded && teamData !== null && participantData !== null ? (
            <>
              <Formik
                initialValues={{
                  name: teamData.name,
                  interestedTopicsAndSkills: teamData.interestedTopicsAndSkills,
                  objectiveStatement: teamData.objectiveStatement,
                  size: teamData.size,
                  visibleInBrowser: teamData.visibleInBrowser
                }}
                onSubmit={updateTeamProfile}
              >
                {(formik) => (
                  <Form onSubmit={formik.handleSubmit}>
                    <ModalSubheading>Profile Data</ModalSubheading>

                    <TeamNameField
                      controlId="tfteTeamName"
                      fieldName="name"
                      formik={formik}
                    />

                    <TopicsAndSkillsSelect
                      controlId="tfteTeamInterestedTopicsAndSkills"
                      fieldName="interestedTopicsAndSkills"
                      multiSelectOptions={multiSelectOptions}
                      setMultiSelectOptions={setMultiSelectOptions}
                      defaultValue={generateSelectOptions(
                        teamData.interestedTopicsAndSkills
                      )}
                      disabled={formik.isSubmitting}
                    >
                      <RequiredFormLabel>
                        Interested Topics and Skills
                      </RequiredFormLabel>
                    </TopicsAndSkillsSelect>

                    <TeamObjectiveStatementField
                      controlId="tfteTeamObjectiveStatement"
                      fieldName="objectiveStatement"
                      formik={formik}
                    />

                    <TeamSizeField
                      controlId="tfteTeamSize"
                      fieldName="size"
                      formik={formik}
                    />

                    <ShowTeamOnBrowserCheckbox
                      teamData={teamData}
                      controlId="tfteVisibileInBrowser"
                      fieldName="visibleInBrowser"
                      formik={formik}
                    />

                    <ModalCenteredButton
                      type="submit"
                      disabled={formik.isSubmitting}
                    >
                      {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </ModalCenteredButton>

                    <CenteredButton
                      variant="secondary"
                      onClick={() => setShow(false)}
                      disabled={formik.isSubmitting}
                    >
                      Cancel
                    </CenteredButton>
                  </Form>
                )}
              </Formik>

              <TeamMembersSection>
                <ModalSubheading>Team Members</ModalSubheading>

                {/*
                    1. Get the leader of the team as a standalone array
                    2. Get the other members of the team without the leader as an array
                    3. Concatenate the array from 1 with 2

                    This ensures the team leader will always be on the top of the member list
                    while also categorizing the other team members for easy management.
                */}
                {teamData.members
                  // 1.
                  .filter((member) => member.id === teamData.leader)
                  // 3.
                  .concat(
                    // 2.
                    teamData.members
                      .filter((member) => member.id !== teamData.leader)
                      .sort((a, b) => {
                        if (a.user.firstName < b.user.firstName) return 1;
                        if (a.user.firstName > b.user.firstName) return -1;
                        return 0;
                      })
                  )
                  .map((member) => (
                    <JoinedTeamMember
                      teamMemberData={member}
                      currentParticipantData={participantData}
                      leaderId={teamData.leader}
                      setShow={setShow}
                      key={member.id}
                    />
                  ))}
              </TeamMembersSection>

              {participantData.id === teamData.leader ? (
                <CenteredButton
                  variant="outline-danger"
                  size="sm"
                  onClick={async () => {
                    if (
                      prompt(
                        'Are you sure you want to delete your team? Deleting your team will immediately remove all members from your team, and this process cannot be undone! If you still want to proceed, enter "DELETE" (in capital letters) to confirm team deletion.'
                      ) === 'DELETE'
                    ) {
                      await deleteTeam();
                    } else {
                      toast('Team deletion canceled.');
                    }
                  }}
                >
                  Delete Team
                </CenteredButton>
              ) : (
                <CenteredButton
                  variant="outline-danger"
                  size="sm"
                  onClick={async () => {
                    if (confirm('Are you sure you want to leave the team?')) {
                      await leaveTeam();
                    }
                  }}
                >
                  Leave Team
                </CenteredButton>
              )}
            </>
          ) : (
            <SlimModalDisplayText>Loading...</SlimModalDisplayText>
          ))}
      </ModalBody>
    </Modal>
  );
};

interface JoinedTeamMemberProps {
  teamMemberData: TeamFormationParticipant;
  currentParticipantData: TeamFormationParticipant;
  leaderId: number;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const JoinedTeamMember = (props: JoinedTeamMemberProps): JSX.Element => {
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
    <JoinedTeamMemberCard>
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
    </JoinedTeamMemberCard>
  );
};

const TeamMembersSection = styled.section`
  margin-top: 2rem;
`;

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

export default EditTeamProfileModal;
