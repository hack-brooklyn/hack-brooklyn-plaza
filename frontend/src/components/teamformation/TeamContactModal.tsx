import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components/macro';

import { JoinedTeamMemberContents } from 'components/teamformation/JoinedTeamMember';
import {
  CloseButton,
  CloseButtonContainer,
  CloseIconImg,
  DisplayText
} from 'common/styles/teamformation/teamFormationInboxModalStyles';
import {
  ModalBody,
  ModalHeading
} from 'common/styles/teamformation/teamFormationModalStyles';
import { getParticipantData, getTeamData } from 'util/teamFormation';
import { handleError } from 'util/plazaUtils';
import {
  CommonModalProps,
  TeamFormationParticipant,
  TeamFormationTeam
} from 'types';

import closeIcon from 'assets/icons/close.svg';

const TeamInboxModal = (props: CommonModalProps): JSX.Element => {
  const { show, setShow } = props;

  const history = useHistory();

  const [
    participantData,
    setParticipantData
  ] = useState<TeamFormationParticipant | null>(null);
  const [teamData, setTeamData] = useState<TeamFormationTeam | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (show) {
      loadTeamContactInfo().catch((err) => handleError(err));
    } else {
      // Reset state
      setTeamData(null);
      setDataLoaded(false);
    }
  }, [show]);

  const loadTeamContactInfo = async () => {
    setTeamData(await getTeamData(history));
    setParticipantData(await getParticipantData(history));
    setDataLoaded(true);
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
        <CloseButtonContainer>
          <CloseButton onClick={() => setShow(false)}>
            <CloseIconImg src={closeIcon} alt="Close Team Contact Info" />
          </CloseButton>
        </CloseButtonContainer>

        <ModalHeading>Team Contact Info</ModalHeading>

        {show &&
          (dataLoaded ? (
            teamData !== null &&
            participantData !== null && (
              <>
                {teamData.members
                  // 1.
                  .filter((member) => member.id === teamData.leader)
                  // 3.
                  .concat(
                    // 2.
                    teamData.members
                      .filter((member) => member.id !== teamData.leader)
                      .sort((a, b) => {
                        if (a.user.firstName < b.user.firstName) return 1;
                        if (a.user.firstName > b.user.firstName) return -1;
                        return 0;
                      })
                  )
                  .map((member) => (
                    <JoinedTeamMemberContactCard key={member.id}>
                      <ContentsContainer>
                        <JoinedTeamMemberContents
                          teamMemberData={member}
                          currentParticipantData={participantData}
                          leaderId={teamData.leader}
                          setShow={setShow}
                        />
                      </ContentsContainer>

                      <ContactInformationText>
                        {member.contactInfo}
                      </ContactInformationText>
                    </JoinedTeamMemberContactCard>
                  ))}
              </>
            )
          ) : (
            <DisplayText>Loading...</DisplayText>
          ))}
      </ModalBody>
    </Modal>
  );
};

const JoinedTeamMemberContactCard = styled.article`
  margin: 1.5rem 0;
  padding: 2rem;

  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
`;

const ContentsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ContactInformationText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 0;
`;

export default TeamInboxModal;
