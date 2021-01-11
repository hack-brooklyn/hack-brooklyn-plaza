import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'views/Home/Home';
import EventApplicationLanding from 'views/EventApplicationLanding/EventApplicationLanding';
import EventApplicationForm from 'views/EventApplicationForm/EventApplicationForm';

const Routes = (): JSX.Element => {
  return (
    <Switch>
      <Route path="/apply/priority">
        <EventApplicationForm />
      </Route>

      <Route path="/apply">
        <EventApplicationLanding />
      </Route>

      <Route path="/" exact>
        <Home />
      </Route>
    </Switch>
  );
};

export default Routes;
