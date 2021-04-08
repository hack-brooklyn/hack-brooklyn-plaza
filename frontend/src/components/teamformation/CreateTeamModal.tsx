import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import {
  TeamNameField,
  TeamObjectiveStatementField,
  TeamSizeField,
  TopicsAndSkillsSelect
} from 'components/teamformation/TeamFormationFormFields';
import { RequiredFormLabel } from 'components';
import {
  ModalBody,
  ModalCenteredButton,
  ModalHeadingNoMarginBottom
} from 'common/styles/teamformation/teamFormationModalStyles';
import { CenteredButton } from 'common/styles/commonStyles';
import { refreshAccessToken } from 'util/auth';
import { handleError } from 'util/plazaUtils';
import { refreshHeadingSectionData } from 'actions/teamFormation';
import { topicsAndSkillsOptions } from 'common/selectOptions/topicsAndSkillsOptions';
import { API_ROOT } from 'index';
import {
  CommonModalProps,
  ConnectionError,
  InvalidSubmittedDataError,
  NoPermissionError,
  RootState,
  TeamFormationTeamNameConflictError,
  UnknownError
} from 'types';

interface CreateTeamInitialFormData {
  interestedTopicsAndSkills: string[];
  name: string;
  objectiveStatement: string;
  size: number | null;
}

const CreateTeamModal = (props: CommonModalProps): JSX.Element => {
  const { show, setShow } = props;

  const dispatch = useDispatch();
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [multiSelectOptions, setMultiSelectOptions] = useState([
    ...topicsAndSkillsOptions
  ]);

  const createTeam = async (
    teamData: CreateTeamInitialFormData,
    { setSubmitting }: FormikHelpers<CreateTeamInitialFormData>
  ) => {
    try {
      await sendCreateTeamRequest(teamData);
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const sendCreateTeamRequest = async (
    teamData: CreateTeamInitialFormData,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/teams`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teamData)
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      toast.success('Your team has been created!');
      dispatch(refreshHeadingSectionData());
      setShow(false);
    } else if (res.status === 409) {
      throw new TeamFormationTeamNameConflictError();
    } else if (res.status === 400) {
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await sendCreateTeamRequest(teamData, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const initialValues: CreateTeamInitialFormData = {
    name: '',
    interestedTopicsAndSkills: [],
    objectiveStatement: '',
    size: null
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
        <ModalHeadingNoMarginBottom>Create New Team</ModalHeadingNoMarginBottom>

        {show && (
          <Formik initialValues={initialValues} onSubmit={createTeam}>
            {(formik) => (
              <Form onSubmit={formik.handleSubmit}>
                <TeamNameField
                  controlId="tfctTeamName"
                  fieldName="name"
                  formik={formik}
                />

                <TopicsAndSkillsSelect
                  controlId="tfctTeamInterestedTopicsAndSkills"
                  fieldName="interestedTopicsAndSkills"
                  multiSelectOptions={multiSelectOptions}
                  setMultiSelectOptions={setMultiSelectOptions}
                  disabled={formik.isSubmitting}
                >
                  <RequiredFormLabel>
                    Interested Topics and Skills
                  </RequiredFormLabel>
                </TopicsAndSkillsSelect>

                <TeamObjectiveStatementField
                  controlId="tfctTeamObjectiveStatement"
                  fieldName="objectiveStatement"
                  formik={formik}
                />

                <TeamSizeField
                  controlId="tfctTeamSize"
                  fieldName="size"
                  formik={formik}
                />

                <ModalCenteredButton
                  type="submit"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? 'Creating...' : 'Create Team'}
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
        )}
      </ModalBody>
    </Modal>
  );
};

export default CreateTeamModal;
