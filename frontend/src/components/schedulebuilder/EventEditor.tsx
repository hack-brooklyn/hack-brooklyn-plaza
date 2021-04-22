import { StyledH1, StyledSubmitButton } from 'common/styles/commonStyles';
import { FastField, Formik } from 'formik';
import React from 'react';
import { Form } from 'react-bootstrap';
import styled from 'styled-components/macro';
import DayJsUtils from '@date-io/dayjs';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

import { Breakpoints, EventData } from 'types';
import { RequiredFormLabel } from '../index';

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
            <RequiredFormLabel>Title</RequiredFormLabel>
            <FastField as={Form.Control} type="text" name="title" id="title" />
            <RequiredFormLabel>Presenter</RequiredFormLabel>
            <FastField
              as={Form.Control}
              type="text"
              name="presenter"
              id="presenter"
            />
            <TimeContainer>
              <MuiPickersUtilsProvider utils={DayJsUtils}>
                <Form.Group>
                  <RequiredFormLabel>Start Date & Time</RequiredFormLabel>
                  <DateTimePicker
                    id="startTime"
                    value={formik.values.startTime}
                    minDate={new Date('2021-4-23T00:00:00')}
                    maxDate={new Date('2021-4-25T00:00:00')}
                    disablePast
                    fullWidth
                    onChange={(e) => {
                      if (e) {
                        formik.setFieldValue('startTime', e.local().toJSON());
                      }
                    }}
                  />
                </Form.Group>
                <Form.Group>
                  <RequiredFormLabel>End Date & Time</RequiredFormLabel>
                  <DateTimePicker
                    id="endTime"
                    value={formik.values.endTime}
                    disablePast
                    fullWidth
                    onChange={(e) => {
                      if (e) {
                        formik.setFieldValue('endTime', e.local().toJSON());
                      }
                    }}
                  />
                </Form.Group>
              </MuiPickersUtilsProvider>
            </TimeContainer>
            <RequiredFormLabel>Description</RequiredFormLabel>
            <FastField
              as="textarea"
              className="form-control"
              name="description"
              id="description"
              rows="5"
              maxLength={2000}
              placeholder={
                'Enter a description for the event. Markdown is supported.'
              }
              disabled={formik.isSubmitting}
              required
            />
            <RequiredFormLabel>External Link</RequiredFormLabel>
            <FastField
              as={Form.Control}
              type="text"
              name="externalLink"
              id="externalLink"
            />
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
