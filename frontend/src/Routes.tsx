import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'views/Home/Home';
import Apply from 'views/Apply/Apply';
import PriorityApplication from 'views/PriorityApplication/PriorityApplication';

const Routes = (): JSX.Element => {
  return (
    <Switch>
      <Route path="/apply/priority">
        <PriorityApplication />
      </Route>

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