import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import Container from 'react-bootstrap/Container';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Navbar } from './components';
import Routes from './Routes';
import store from './store';
import { refreshAccessToken } from 'util/auth';

const App = (): JSX.Element => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>

      <ToastContainer />
    </Provider>
  );
};

const AppContent = () => {
  const [appReady, setAppReady] = useState(false);

  const history = useHistory();

  useEffect(() => {
    const isUserLoggedIn = localStorage.getItem('isUserLoggedIn');
    if (isUserLoggedIn !== null && JSON.parse(isUserLoggedIn)) {
      const authenticateWithToken = async () => {
        try {
          await refreshAccessToken(history);
        } catch (err) {
          console.error(err);
        } finally {
          setAppReady(true);
        }
      };

      authenticateWithToken();
    } else {
      localStorage.setItem('isUserLoggedIn', JSON.stringify(false));
      setAppReady(true);
    }
  }, []);

  return appReady ? <MainContent /> : <LoadingContent />;
};

const MainContent = () => {
  return (
    <>
      <header>
        <Navbar />
      </header>

      <StyledMain>
        <Container>
          <Routes />
        </Container>
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
