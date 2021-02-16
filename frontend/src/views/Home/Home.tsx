import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const Home = (): JSX.Element => {

  const history = useHistory();

  // Temporary redirect until the platform opens up
  useEffect(() => {
    history.push('/apply');
  }, []);

  return (
    <>
      {/*<h1>Welcome to Hack Brooklyn Plaza.</h1>*/}
      {/*<p>Hack Brooklyn Plaza is currently under development. Please check back after acceptances begin releasing.</p>*/}
    </>
  );
};

export default Home;
