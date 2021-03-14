import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { ApplicationLanding, ApplicationPage, Dashboard, Landing, Login } from 'views';
import { RootState } from 'types';


const Routes = (): JSX.Element => {
  const userIsLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  return (
    <Switch>
      <Route path="/login">
        <Login />
      </Route>

      <Route path="/apply/form">
        <ApplicationPage />
      </Route>

      <Route path="/apply">
        <ApplicationLanding />
      </Route>

      <Route path="/" exact>
        {userIsLoggedIn ? <Dashboard /> : <Landing />}
      </Route>
    </Switch>
  );
};

export default Routes;
