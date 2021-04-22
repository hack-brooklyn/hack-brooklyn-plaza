import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {
  AnnouncementsSection,
  ScheduleSection,
  TimeRemainingSection
} from './';

const Live = (): JSX.Element => {
  return (
    <Row>
      <Col lg={7}>
        <TimeRemainingSection />
        <AnnouncementsSection />
      </Col>

      <Col lg={5}>
        <ScheduleSection />
      </Col>
    </Row>
  );
};

export default Live;
