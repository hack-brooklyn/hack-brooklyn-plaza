import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import styled from 'styled-components/macro';
import Container from 'react-bootstrap/Container';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Navbar } from 'components';
import Routes from './Routes';

const App = (): JSX.Element => {
  return (
    <Router>
      <header>
        <Navbar />
      </header>

      <StyledMain>
        <Container>
          <Routes />
        </Container>
        <ToastContainer />
      </StyledMain>
    </Router>
  );
};

const StyledMain = styled.main`
  margin: 7rem 1rem;

  @media screen and (min-width: 992px) {
    margin: 7rem auto;
  }
`;

export default App;
