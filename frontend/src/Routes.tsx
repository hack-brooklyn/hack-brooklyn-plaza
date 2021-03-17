import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { Activate, ApplicationLanding, ApplicationPage, Dashboard, Landing, Login, ManageApplications } from 'views';
import { RootState } from 'types';
import ForgotPassword from 'views/ForgotPassword';


const Routes = (): JSX.Element => {
  const userIsLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  return (
    <Switch>
      <Route path="/admin/applications">
        <ManageApplications />
      </Route>

      <Route path="/login">
        <Login />
      </Route>

      <Route path="/apply/form">
        <ApplicationPage />
      </Route>

      <Route path="/apply">
        <ApplicationLanding />
      </Route>

      <Route path="/activate">
        <Activate />
      </Route>

      <Route path="/resetpassword">
        <ForgotPassword />
      </Route>

      <Route path="/" exact>
        {userIsLoggedIn ? <Dashboard /> : <Landing />}
      </Route>
    </Switch>
  );
};

export default Routes;
