import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { ApplicationLanding, ApplicationPage, Landing, Login, Dashboard } from 'views';


const Routes = (): JSX.Element => {

  return (
    <Switch>
      <Route path="/dashboard" exact>
        <Dashboard />
      </Route>

      <Route path="/login" exact>
        <Login />
      </Route>

      <Route path="/apply/form">
        <ApplicationPage />
      </Route>

      <Route path="/apply">
        <ApplicationLanding />
      </Route>

      <Route path="/" exact>
        <Landing />
      </Route>
    </Switch>
  );
};

export default Routes;
