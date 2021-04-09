import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import {
  TeamSetupComplete,
  TeamStepOne,
  TeamStepThree,
  TeamStepTwo
} from './components';
import {
  SetupOption,
  SetupOptionDescription,
  SetupOptionIcon,
  TopSection
} from 'common/styles/teamformation/teamFormationSetupStyles';
import { StyledCenteredH2 } from 'common/styles/commonStyles';
import { topicsAndSkillsOptions } from 'common/selectOptions/topicsAndSkillsOptions';
import { validateTopicsAndSkills } from 'util/teamFormation';
import { handleError, handleErrorAndPush } from 'util/plazaUtils';
import { acCan, refreshAccessToken } from 'util/auth';
import { refreshHeadingSectionData } from 'actions/teamFormation';
import { Resources } from 'security/accessControl';
import {
  ConnectionError,
  InvalidSubmittedDataError,
  NoPermissionError,
  Option,
  RootState,
  TeamFormationParticipantAlreadyExistsError,
  TeamFormationParticipantFormData,
  TeamFormationTeamFormData,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';

import haveATeamIcon from 'assets/icons/team-formation/have-a-team.svg';

interface ParticipantAndTeamSetupFormData {
  // Participant
  participantInterestedTopicsAndSkills: string[];
  participantSpecialization: string;
  participantObjectiveStatement: string;
  participantContactInfo: string;

  // Team
  teamName: string;
  teamInterestedTopicsAndSkills: string[];
  teamObjectiveStatement: string;
  teamSize: number | null;
}

export interface TeamSetupStepProps {
  formik: FormikProps<ParticipantAndTeamSetupFormData>;
  setCurrentStep: React.Dispatch<React.SetStateAction<1 | 2 | 3>>;
}

export interface TeamSetupStepPropsMultiSelect extends TeamSetupStepProps {
  multiSelectOptions: Option[];
  setMultiSelectOptions: React.Dispatch<React.SetStateAction<Option[]>>;
}

interface CreateParticipantAndTeamRequest {
  participant: TeamFormationParticipantFormData;
  team: TeamFormationTeamFormData;
}

const TeamFormationTeamSetup = (): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );
  const userRole = useSelector((state: RootState) => state.user.role);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [setupComplete, setSetupComplete] = useState(false);
  const [
    participantMultiSelectOptions,
    setParticipantMultiSelectOptions
  ] = useState([...topicsAndSkillsOptions]);
  const [teamMultiSelectOptions, setTeamMultiSelectOptions] = useState([
    ...topicsAndSkillsOptions
  ]);

  useEffect(() => {
    try {
      const permission = acCan(userRole).createOwn(
        Resources.TeamFormationTeams
      );
      if (!permission.granted) throw new NoPermissionError();
    } catch (err) {
      handleErrorAndPush(err, history);
    }
  }, []);

  const initialValues: ParticipantAndTeamSetupFormData = {
    // Participant
    participantInterestedTopicsAndSkills: [],
    participantSpecialization: '',
    participantObjectiveStatement: '',
    participantContactInfo: '',

    // Team
    teamName: '',
    teamInterestedTopicsAndSkills: [],
    teamObjectiveStatement: '',
    teamSize: null
  };

  const createParticipantAndTeam = async (
    formData: ParticipantAndTeamSetupFormData,
    { setSubmitting }: FormikHelpers<ParticipantAndTeamSetupFormData>
  ) => {
    // Validate and warn the user if the form data is bad before sending the request
    try {
      validateTopicsAndSkills(formData.teamInterestedTopicsAndSkills);
      if (formData.teamSize === null) {
        throw new Error('Please provide a valid team size.');
      }
    } catch (err) {
      toast.warning(err.message);
      setSubmitting(false);
      return;
    }

    try {
      await sendCreateParticipantAndTeamRequest(formData);
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const sendCreateParticipantAndTeamRequest = async (
    formData: ParticipantAndTeamSetupFormData,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    if (formData.teamSize === null) throw new Error('Team size is required.');

    const participantAndTeamData: CreateParticipantAndTeamRequest = {
      participant: {
        interestedTopicsAndSkills:
          formData.participantInterestedTopicsAndSkills,
        specialization: formData.participantSpecialization,
        objectiveStatement: formData.participantObjectiveStatement,
        contactInfo: formData.participantContactInfo,
      },
      team: {
        name: formData.teamName,
        interestedTopicsAndSkills: formData.teamInterestedTopicsAndSkills,
        objectiveStatement: formData.teamObjectiveStatement,
        size: formData.teamSize
      }
    };

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/createParticipantAndTeam`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(participantAndTeamData)
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      toast.success(
        'Your team formation profile and team have been successfully created!'
      );
      dispatch(refreshHeadingSectionData());
      setSetupComplete(true);
    } else if (res.status === 409) {
      throw new TeamFormationParticipantAlreadyExistsError();
    } else if (res.status === 400) {
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await sendCreateParticipantAndTeamRequest(formData, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <>
      <TopSection>
        <StyledCenteredH2>Welcome to Team Formation!</StyledCenteredH2>

        <SetupOption>
          <SetupOptionIcon src={haveATeamIcon} alt="Have a team" />
          <SetupOptionDescription>
            I have a team/want to create a new team and am looking for members
          </SetupOptionDescription>
        </SetupOption>
      </TopSection>

      {setupComplete ? (
        <TeamSetupComplete />
      ) : (
        <Formik
          initialValues={initialValues}
          onSubmit={createParticipantAndTeam}
        >
          {(formik) => (
            <Form onSubmit={formik.handleSubmit}>
              {currentStep === 1 && (
                <TeamStepOne
                  formik={formik}
                  setCurrentStep={setCurrentStep}
                  multiSelectOptions={participantMultiSelectOptions}
                  setMultiSelectOptions={setParticipantMultiSelectOptions}
                />
              )}

              {currentStep === 2 && (
                <TeamStepTwo formik={formik} setCurrentStep={setCurrentStep} />
              )}

              {currentStep === 3 && (
                <TeamStepThree
                  formik={formik}
                  setCurrentStep={setCurrentStep}
                  multiSelectOptions={teamMultiSelectOptions}
                  setMultiSelectOptions={setTeamMultiSelectOptions}
                />
              )}
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};

export default TeamFormationTeamSetup;
