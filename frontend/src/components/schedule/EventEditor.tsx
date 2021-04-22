import React from 'react';
import { FastField, Formik } from 'formik';
import styled from 'styled-components/macro';
import Form from 'react-bootstrap/Form';
import DayJsUtils from '@date-io/dayjs';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

import { RequiredFormLabel } from 'components';
import { StyledH1, StyledSubmitButton } from 'common/styles/commonStyles';
import { Breakpoints, EventData } from 'types';

interface EventEditorData {
  eventData: EventData;
  actionType: string;
  submitForm: (eventData: EventData) => Promise<void>;
}

const EventEditor = (props: EventEditorData): JSX.Element => {
  const { eventData, actionType, submitForm } = props;

  return (
    <>
      <StyledH1>{`${actionType} Event`}</StyledH1>
      <Formik initialValues={eventData} onSubmit={submitForm}>
        {(formik) => (
          <StyledEventEditorForm onSubmit={formik.handleSubmit}>
            <Form.Group controlId="eventTitle">
              <RequiredFormLabel>Title</RequiredFormLabel>
              <FastField as={Form.Control} type="text" name="title" required />
            </Form.Group>

            <Form.Group controlId="eventPresenter">
              <RequiredFormLabel>Presenter</RequiredFormLabel>
              <FastField
                as={Form.Control}
                type="text"
                name="presenter"
                required
              />
            </Form.Group>

            <TimeContainer>
              <MuiPickersUtilsProvider utils={DayJsUtils}>
                <Form.Group controlId="eventStartTime">
                  <RequiredFormLabel>Start Date & Time</RequiredFormLabel>
                  <DateTimePicker
                    value={formik.values.startTime}
                    minDate={new Date('2021-4-23T00:00:00')}
                    maxDate={new Date('2021-4-25T00:00:00')}
                    disablePast
                    fullWidth
                    required
                    onChange={(e) => {
                      if (e) {
                        formik.setFieldValue('startTime', e.local().toJSON());
                      }
                    }}
                  />
                </Form.Group>

                <Form.Group controlId="eventEndTime">
                  <RequiredFormLabel>End Date & Time</RequiredFormLabel>
                  <DateTimePicker
                    value={formik.values.endTime}
                    disablePast
                    fullWidth
                    required
                    onChange={(e) => {
                      if (e) {
                        formik.setFieldValue('endTime', e.local().toJSON());
                      }
                    }}
                  />
                </Form.Group>
              </MuiPickersUtilsProvider>
            </TimeContainer>

            <Form.Group controlId="eventDescription">
              <RequiredFormLabel>Description</RequiredFormLabel>
              <FastField
                as="textarea"
                className="form-control"
                name="description"
                rows="5"
                maxLength={2000}
                placeholder={
                  'Enter a description for the event. Markdown is supported.'
                }
                disabled={formik.isSubmitting}
                required
              />
            </Form.Group>

            <Form.Group controlId="eventExternalLink">
              <RequiredFormLabel>External Link</RequiredFormLabel>
              <FastField
                as={Form.Control}
                type="text"
                name="externalLink"
                id="externalLink"
                required
              />
            </Form.Group>

            <StyledSubmitButton type="submit" size="lg">
              {actionType === 'Create' ? 'Create Event' : 'Save Changes'}
            </StyledSubmitButton>
          </StyledEventEditorForm>
        )}
      </Formik>
    </>
  );
};

const TimeContainer = styled(Form.Group)`
  & div:before, & div:hover:not(.Mui-disabled):before, & div:after {
    border-bottom: none;
  }

  & input[type=text] {
    display: block;
    width: 100%;
    padding: .375rem .75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    height: inherit;
    color: #212529;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: .25rem;
  }
}

@media screen and (min-width: ${Breakpoints.Small}px) {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  & > div {
    width: 48%;
  }
}
`;

const StyledEventEditorForm = styled(Form)`
  margin: 1rem auto;
  max-width: 600px;
`;

export default EventEditor;
