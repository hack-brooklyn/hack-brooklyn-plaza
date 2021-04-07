import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import styled from 'styled-components/macro';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import {
  TopicsAndSkillsSelect,
  ParticipantObjectiveStatementField,
  ParticipantSpecializationField
} from 'components/teamformation/TeamFormationFormFields';
import { RequiredFormLabel } from 'components';
import {
  ModalBody,
  ModalHeadingNoMarginBottom
} from 'common/styles/teamformation/teamFormationModalStyles';
import { DisplayText } from 'common/styles/teamformation/teamFormationInboxModalStyles';
import { CenteredButton } from 'common/styles/commonStyles';
import { refreshAccessToken } from 'util/auth';
import { getParticipantData } from 'util/teamFormation';
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
  TeamFormationParticipantSetupData,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';

const EditParticipantProfileModal = (props: CommonModalProps): JSX.Element => {
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
  const [multiSelectOptions, setMultiSelectOptions] = useState([
    ...topicsAndSkillsOptions
  ]);
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    if (show) {
      getParticipantData(history)
        .then((data) => {
          setParticipantData(data);
          setMultiSelectOptions([
            ...topicsAndSkillsOptions,
            ...generateSelectOptions(data.interestedTopicsAndSkills)
          ]);
          setFormLoaded(true);
        })
        .catch((err) => handleError(err));
    } else {
      // Reset state
      setParticipantData(null);
      setMultiSelectOptions([...topicsAndSkillsOptions]);
      setFormLoaded(false);
    }
  }, [show]);

  const updateProfile = async (
    profileData: TeamFormationParticipantSetupData,
    { setSubmitting }: FormikHelpers<TeamFormationParticipantSetupData>
  ) => {
    try {
      await sendUpdateProfileRequest(profileData);
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const sendUpdateProfileRequest = async (
    profileData: TeamFormationParticipantSetupData,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/participants/userData`, {
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
      toast.success('Your team formation profile has been updated!');
      dispatch(refreshHeadingSectionData());
      setShow(false);
    } else if (res.status === 400) {
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await sendUpdateProfileRequest(profileData, refreshedToken);
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
        <ModalHeadingNoMarginBottom>Edit My Profile</ModalHeadingNoMarginBottom>

        {show &&
          (formLoaded && participantData !== null ? (
            <Formik
              initialValues={{
                interestedTopicsAndSkills: participantData
                  ? participantData.interestedTopicsAndSkills
                  : [],
                specialization: participantData
                  ? participantData.specialization
                  : '',
                objectiveStatement: participantData
                  ? participantData.objectiveStatement
                  : ''
              }}
              onSubmit={updateProfile}
            >
              {(formik) => (
                <Form onSubmit={formik.handleSubmit}>
                  <TopicsAndSkillsSelect
                    controlId="tfpeInterestedTopicsAndSkills"
                    fieldName="interestedTopicsAndSkills"
                    multiSelectOptions={multiSelectOptions}
                    setMultiSelectOptions={setMultiSelectOptions}
                    defaultValue={generateSelectOptions(
                      participantData.interestedTopicsAndSkills
                    )}
                    disabled={formik.isSubmitting}
                  >
                    <RequiredFormLabel>
                      Interested Topics and Skills
                    </RequiredFormLabel>
                  </TopicsAndSkillsSelect>

                  <ParticipantSpecializationField
                    controlId="tfpeSpecialization"
                    fieldName="specialization"
                    formik={formik}
                  />

                  <ParticipantObjectiveStatementField
                    controlId="tfpeObjectiveStatement"
                    fieldName="objectiveStatement"
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
          ) : (
            <SlimModalDisplayText>Loading...</SlimModalDisplayText>
          ))}
      </ModalBody>
    </Modal>
  );
};

const ModalCenteredButton = styled(CenteredButton)`
  margin-top: 1rem;
  margin-bottom: 0.75rem;
`;

const SlimModalDisplayText = styled(DisplayText)`
  padding-top: 2rem;
`;

export default EditParticipantProfileModal;
