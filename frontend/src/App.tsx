import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import styled from 'styled-components/macro';
import Container from 'react-bootstrap/Container';
import Routes from './Routes';
import Navbar from 'components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  margin: 2rem 1rem;

  @media screen and (min-width: 992px) {
    margin: 2rem auto;
  }
`;

export default App;
