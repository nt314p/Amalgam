import { useState } from 'react';
import Login from './components/Login';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./components/Home";
import NotFound404 from "./components/NotFound404";

const App = () => {

  const [token, setToken] = useState(null);
  const [loggedIn, setLoggedIn] = useState(true);

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" render={(props) => <Home {...props} isLoggedIn={loggedIn} />} />
        <Route exact path="/login" render={
          (props) => <Login {...props} signUp={false} loggedIn={loggedIn} setToken={setToken} setLoggedIn={setLoggedIn} />}>
        </Route>
        <Route path="/" component={NotFound404} />
      </Switch>
    </BrowserRouter>
    //<Login signUp={false} loggedIn={loggedIn} setToken={setToken} setLoggedIn={setLoggedIn} />
  )
}

export default App
