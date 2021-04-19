import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import {
  ParticipantContactInfoField,
  ParticipantObjectiveStatementField,
  ParticipantSpecializationField,
  ShowParticipantOnBrowserCheckbox,
  TopicsAndSkillsSelect
} from 'components/teamformation/TeamFormationFormFields';
import { RequiredFormLabel } from 'components';
import {
  ModalBody,
  ModalCenteredButton,
  ModalHeadingNoMarginBottom,
  SlimModalDisplayText
} from 'common/styles/teamformation/teamFormationModalStyles';
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
  TeamFormationParticipantFormDataWithBrowserVisibility,
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
    profileData: TeamFormationParticipantFormDataWithBrowserVisibility,
    {
      setSubmitting
    }: FormikHelpers<TeamFormationParticipantFormDataWithBrowserVisibility>
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
    profileData: TeamFormationParticipantFormDataWithBrowserVisibility,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/participants/currentUser`, {
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
                interestedTopicsAndSkills:
                  participantData.interestedTopicsAndSkills,
                specialization: participantData.specialization,
                objectiveStatement: participantData.objectiveStatement,
                visibleInBrowser: participantData.visibleInBrowser,
                contactInfo: participantData.contactInfo
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

                  <ParticipantContactInfoField
                    controlId="tfpeContactInfo"
                    fieldName="contactInfo"
                    formik={formik}
                  />

                  <ShowParticipantOnBrowserCheckbox
                    participantData={participantData}
                    controlId="tfpeVisibileInBrowser"
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
          ) : (
            <SlimModalDisplayText>Loading...</SlimModalDisplayText>
          ))}
      </ModalBody>
    </Modal>
  );
};

export default EditParticipantProfileModal;
