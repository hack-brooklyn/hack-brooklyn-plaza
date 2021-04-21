import React, { Dispatch } from 'react';
import styled from 'styled-components/macro';
import Modal from 'react-bootstrap/Modal';
import ModalBody from 'react-bootstrap/ModalBody';

import { CommonModalProps, EventData } from 'types';
import {
  CloseButton,
  CloseButtonContainer,
  CloseIconImg
} from 'common/styles/teamformation/teamFormationInboxModalStyles';
import EventDetail from './EventDetail';
import closeIcon from 'assets/icons/close.svg';

interface EventDetailModal extends CommonModalProps {
  event?: EventData;
  setRefresh: Dispatch<React.SetStateAction<boolean>>;
  removeSelectedEvent: () => void;
}

const EventDetailModal = (props: EventDetailModal): JSX.Element => {
  const { event, setShow, show, setRefresh, removeSelectedEvent } = props;
  return (
    <Modal
      show={show}
      size="lg"
      onHide={() => setShow(false)}
      dialogClassName="modal-fullscreen-lg-down"
      handleClose={() => setShow(false)}
    >
      <ModalBody>
        <CloseButtonContainer>
          <CloseButton onClick={() => setShow(false)}>
            <CloseIconImg src={closeIcon} alt="Close Team Event Detail" />
          </CloseButton>
        </CloseButtonContainer>
        {show && (
          <EventDetailContainer>
            <EventDetail
              event={event}
              setRefresh={setRefresh}
              removeSelectedEvent={removeSelectedEvent}
            />
          </EventDetailContainer>
        )}
      </ModalBody>
    </Modal>
  );
};

const EventDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  padding: 1rem;
  max-width: 37rem;
  margin: 0 auto;
`;

export default EventDetailModal;
