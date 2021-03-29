import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import { ParticipantStepOne, ParticipantStepTwo } from './components';
import { StyledCenteredH2, StyledH1 } from 'commonStyles';
import {
  SetupOption,
  SetupOptionDescription,
  SetupOptionIcon,
  TopSection
} from 'common/styles/teamFormationSetupStyles';
import { acCan, refreshAccessToken } from 'util/auth';
import { handleError, handleErrorAndPush } from 'util/plazaUtils';
import { Resources } from 'security/accessControl';
import { defaultTopicsAndSkills } from 'common/defaultTopicsAndSkills';
import {
  ConnectionError,
  InvalidSubmittedDataError,
  NoPermissionError,
  Option,
  RootState,
  TeamFormationParticipantAlreadyExistsError,
  TeamFormationParticipantData,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';

import lookingForTeamIcon from 'assets/icons/team-formation/looking-for-team.svg';

export interface ParticipantSetupStepProps {
  formik: FormikProps<TeamFormationParticipantData>;
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

  const initialValues: TeamFormationParticipantData = {
    interestedTopicsAndSkills: [],
    specialization: '',
    objectiveStatement: ''
  };

  useEffect(() => {
    try {
      const permission = acCan(userRole).createOwn(
        Resources.TeamFormationParticipants
      );
      if (!permission.granted) throw new NoPermissionError();
    } catch (err) {
      handleErrorAndPush(err, history);
    }
  }, []);

  const createProfile = async (
    profileData: TeamFormationParticipantData,
    { setSubmitting }: FormikHelpers<TeamFormationParticipantData>
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
    profileData: TeamFormationParticipantData,
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

export default TeamFormationParticipantSetup;
