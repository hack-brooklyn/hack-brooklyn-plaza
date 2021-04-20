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
      <Col lg={6}>
        <TimeRemainingSection />
        <AnnouncementsSection />
      </Col>

      <Col lg={6}>
        <ScheduleSection />
      </Col>
    </Row>
  );
};

export default Live;
