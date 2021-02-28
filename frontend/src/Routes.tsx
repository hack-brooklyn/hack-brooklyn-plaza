import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Home, ApplicationLanding, ApplicationPage } from 'views';

const Routes = (): JSX.Element => {
  return (
    <Switch>
      <Route path="/apply/form">
        <ApplicationPage />
      </Route>

      <Route path="/apply">
        <ApplicationLanding />
      </Route>

      <Route path="/" exact>
        <Home />
      </Route>
    </Switch>
  );
};

export default Routes;
