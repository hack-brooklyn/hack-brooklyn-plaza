import React, { useState } from 'react';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import { StyledCenteredH2, StyledH1 } from 'commonStyles';
import {
  SetupOption,
  SetupOptionDescription,
  SetupOptionIcon,
  TopSection
} from 'common/styles/teamFormationSetupStyles';

import haveATeamIcon from 'assets/icons/team-formation/have-a-team.svg';
import { TeamStepOne, TeamStepThree, TeamStepTwo } from './components';
import { validateInterestedTopicsAndSkills } from 'views/TeamFormationParticipantSetup/components/ParticipantStepOne';
import { defaultTopicsAndSkills } from 'common/defaultTopicsAndSkills';
import { Option } from 'types';

export interface TeamSetupData {
  // Participant
  participantInterestedTopicsAndSkills: string[];
  participantSpecialization: string;
  participantObjectiveStatement: string;

  // Team
  teamName: string;
  teamInterestedTopicsAndSkills: string[];
  teamObjectiveStatement: string;
  teamSize: number | null;
}

export interface TeamSetupStepProps {
  formik: FormikProps<TeamSetupData>;
  setCurrentStep: React.Dispatch<React.SetStateAction<1 | 2 | 3>>;
}

export interface TeamSetupStepPropsMultiSelect extends TeamSetupStepProps {
  multiSelectOptions: Option[];
  setMultiSelectOptions: React.Dispatch<React.SetStateAction<Option[]>>;
}

const TeamFormationTeamSetup = (): JSX.Element => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [
    participantMultiSelectOptions,
    setParticipantMultiSelectOptions
  ] = useState([...defaultTopicsAndSkills]);
  const [teamMultiSelectOptions, setTeamMultiSelectOptions] = useState([
    ...defaultTopicsAndSkills
  ]);

  const initialValues: TeamSetupData = {
    // Participant
    participantInterestedTopicsAndSkills: [],
    participantSpecialization: '',
    participantObjectiveStatement: '',

    // Team
    teamName: '',
    teamInterestedTopicsAndSkills: [],
    teamObjectiveStatement: '',
    teamSize: null
  };

  const createParticipantAndTeamProfile = (
    data: TeamSetupData,
    { setSubmitting }: FormikHelpers<TeamSetupData>
  ) => {
    try {
      validateInterestedTopicsAndSkills(data.teamInterestedTopicsAndSkills);
    } catch (err) {
      toast.warning(err.message);
      setSubmitting(false);
      return;
    }

    console.log(data);
    toast.success('Created');
    setSubmitting(false);
  };

  return (
    <>
      <StyledH1>Team Formation - Team Setup</StyledH1>

      <TopSection>
        <StyledCenteredH2>Welcome to Team Formation!</StyledCenteredH2>

        <SetupOption>
          <SetupOptionIcon src={haveATeamIcon} alt="Have a team" />
          <SetupOptionDescription>
            I have a team/want to create a new team and am looking for members
          </SetupOptionDescription>
        </SetupOption>
      </TopSection>

      <Formik
        initialValues={initialValues}
        onSubmit={createParticipantAndTeamProfile}
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
    </>
  );
};

export default TeamFormationTeamSetup;
