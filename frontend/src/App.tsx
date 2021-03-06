import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import {
  BrowserRouter as Router,
  useHistory,
  useRouteMatch
} from 'react-router-dom';
import styled from 'styled-components/macro';
import Container from 'react-bootstrap/Container';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { BurgerMenu, Navbar } from './components';
import Routes from './Routes';
import store from './store';
import { setWindowWidth } from 'actions/app';
import { logIn } from 'actions/auth';
import { refreshAccessToken, refreshUserData } from 'util/auth';
import { subscribeToPushNotifications } from 'util/notificationService';
import { Breakpoints, RootState } from 'types';

import logo from 'assets/logo.png';
import loadingIcon from 'assets/icons/loading.svg';

const App = (): JSX.Element => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
        <BurgerMenu />
      </Router>

      <ToastContainer />
    </Provider>
  );
};

const AppContent = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Add window width event listener
    const handleWindowResize = () =>
      dispatch(setWindowWidth(window.innerWidth));
    window.addEventListener('resize', handleWindowResize);

    // Attempt to refresh login token only if the user logged in before
    const isUserLoggedIn = localStorage.getItem('isUserLoggedIn');
    if (isUserLoggedIn !== null && JSON.parse(isUserLoggedIn)) {
      const authenticateWithToken = async () => {
        try {
          await refreshAccessToken(history);
          await refreshUserData();
          store.dispatch(logIn());
        } catch (err) {
          console.error(err);
          toast.error(err.message);
        } finally {
          setAppReady(true);
        }
      };

      authenticateWithToken();
    } else {
      localStorage.setItem('isUserLoggedIn', JSON.stringify(false));
      setAppReady(true);
    }

    const isNotificationPromptClosed = localStorage.getItem(
      'isNotificationPromptClosed'
    );

    if (isNotificationPromptClosed === null) {
      localStorage.setItem('isNotificationPromptClosed', JSON.stringify(false));
    }

    if (
      isUserLoggedIn &&
      !JSON.parse(isNotificationPromptClosed as string) &&
      'Notification' in window
    ) {
      toast.info(
        `Want to receive the latest updates about Hack Brooklyn even when Hack Brooklyn Plaza is closed? Click here to enable real-time browser notifications.`,
        {
          delay: 5000, // Wait 5 seconds before prompting to enable notifications.
          position:
            windowWidth < Breakpoints.Medium ? 'bottom-center' : 'top-left',
          autoClose: false,
          draggable: false,
          onClick: () => subscribeToPushNotifications(),
          onClose: () =>
            localStorage.setItem(
              'isNotificationPromptClosed',
              JSON.stringify(true)
            )
        }
      );
    }

    return () => {
      // Clean up event listeners
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return appReady ? <MainContent /> : <LoadingContent />;
};

const MainContent = () => {
  // Hide extra page bottom padding on fullscreen pages without scrolling
  const isOnFullscreenPage = useRouteMatch(['/schedule']);

  return (
    <>
      <StyledHeader>
        <Container>
          <Navbar />
        </Container>
      </StyledHeader>

      <StyledMain>
        <Container>
          <Routes />
        </Container>
      </StyledMain>

      {!isOnFullscreenPage && <PageBottomPadding />}
    </>
  );
};

const LoadingContent = () => {
  return (
    <LoadingSection>
      <LoadingLogoImg src={logo} alt="Hack Brooklyn" />
      <LoadingSpinnerImg src={loadingIcon} alt="Loading..." />
    </LoadingSection>
  );
};

const StyledHeader = styled.header`
  height: 4rem;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;

  position: fixed;
  background-color: white;
  top: 0;
  width: 100%;

  /* Ensure header is above Bootstrap dropdowns */
  z-index: 1001;
`;

const StyledMain = styled.main`
  margin: 7rem 1rem 0;

  @media screen and (min-width: 992px) {
    margin: 7rem auto 0;
  }
`;

const LoadingSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10rem auto;
`;

const LoadingLogoImg = styled.img`
  height: 12rem;
  width: 12rem;
  margin-bottom: 2rem;
`;

const LoadingSpinnerImg = styled.img`
  height: 4rem;
  width: 4rem;
`;

const PageBottomPadding = styled.div`
  margin-bottom: 4rem;
`;

export default App;
