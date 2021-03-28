import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import { ParticipantStepOne, ParticipantStepTwo } from './components';
import { StyledCenteredH2, StyledH1 } from 'commonStyles';
import { acCan, refreshAccessToken } from 'util/auth';
import { handleError, handleErrorAndPush } from 'util/plazaUtils';
import { Resources } from 'security/accessControl';
import { defaultTopicsAndSkills } from 'common/defaultTopicsAndSkills';
import {
  Breakpoints,
  ConnectionError,
  InvalidSubmittedDataError,
  NoPermissionError,
  Option,
  ParticipantProfileData,
  RootState,
  TeamFormationParticipantAlreadyExistsError,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';

import lookingForTeamIcon from 'assets/icons/team-formation/looking-for-team.svg';

export interface ParticipantSetupStepProps {
  formik: FormikProps<ParticipantProfileData>;
  setCurrentStep: React.Dispatch<React.SetStateAction<1 | 2>>;
}

export interface ParticipantSetupStepPropsMultiSelect
  extends ParticipantSetupStepProps {
  multiSelectOptions: Option[];
  setMultiSelectOptions: React.Dispatch<React.SetStateAction<Option[]>>;
}

const TeamFormationParticipantSetup = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );
  const userRole = useSelector((state: RootState) => state.user.role);

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [multiSelectOptions, setMultiSelectOptions] = useState([
    ...defaultTopicsAndSkills
  ]);

  const initialValues: ParticipantProfileData = {
    interestedTopicsAndSkills: [],
    specialization: '',
    objectiveStatement: ''
  };

  useEffect(() => {
    try {
      const permission = acCan(userRole).createOwn(Resources.TeamFormationParticipants);
      if (!permission.granted) throw new NoPermissionError();
    } catch (err) {
      handleErrorAndPush(err, history);
    }
  }, []);

  const createProfile = async (
    profileData: ParticipantProfileData,
    { setSubmitting }: FormikHelpers<ParticipantProfileData>
  ) => {
    try {
      await sendCreateProfileRequest(profileData);
    } catch (err) {
      handleError(err);
      return;
    } finally {
      setSubmitting(false);
    }
  };

  const sendCreateProfileRequest = async (
    profileData: ParticipantProfileData,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/participants`, {
        method: 'POST',
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
      toast.success(
        'Your team formation profile has been successfully created!'
      );
    } else if (res.status === 409) {
      throw new TeamFormationParticipantAlreadyExistsError();
    } else if (res.status === 400) {
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await sendCreateProfileRequest(profileData, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <>
      <StyledH1>Team Formation - Participant Setup</StyledH1>

      <TopSection>
        <StyledCenteredH2>Welcome to Team Formation!</StyledCenteredH2>

        <SetupOption>
          <SetupOptionIcon src={lookingForTeamIcon} alt="Looking for team" />
          <SetupOptionDescription>
            I don’t have a team yet and am looking for a team to join
          </SetupOptionDescription>
        </SetupOption>
      </TopSection>

      <Formik initialValues={initialValues} onSubmit={createProfile}>
        {(formik) => (
          <Form onSubmit={formik.handleSubmit}>
            {currentStep === 1 && (
              <ParticipantStepOne
                formik={formik}
                setCurrentStep={setCurrentStep}
                multiSelectOptions={multiSelectOptions}
                setMultiSelectOptions={setMultiSelectOptions}
              />
            )}

            {currentStep === 2 && (
              <ParticipantStepTwo
                formik={formik}
                setCurrentStep={setCurrentStep}
              />
            )}
          </Form>
        )}
      </Formik>
    </>
  );
};

const TopSection = styled.section`
  margin: 2rem auto;
`;

const SetupOption = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const SetupOptionIcon = styled.img`
  height: 4rem;
  width: 4rem;
`;

const SetupOptionDescription = styled.div`
  margin-left: 1rem;
  max-width: 275px;
  font-size: 1.3rem;
  font-weight: bold;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    text-align: center;
  }
`;

export default TeamFormationParticipantSetup;
