import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'views/Home/Home';
import Apply from 'views/Apply/Apply';

const Routes = (): JSX.Element => {
  return (
    <Switch>
      <Route path="/apply">
        <Apply />
      </Route>

      <Route path="/" exact>
        <Home />
      </Route>
    </Switch>
  );
};

export default Routes;