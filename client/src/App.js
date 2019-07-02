import React from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch,
  RouteComponentProps,
  withRouter
} from "react-router-dom";
import { Provider } from 'react-redux';
import store from './store';
import LandingPage from "./components/LandingPage";
import SignUpForm from "./components/signup/SignUpForm";
import SignInForm from "./components/signin/SignInForm";
import HomePage from "./components/HomePage/index";
import ProfileContainer from "./components/HomePage/ProfileContainer/ProfileContainer";

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

//import PasswordGenerator from './passwordGenerator';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        {/* <Header/> */}
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route exact path="/SignUp" component={SignUpForm} />
          <Route exact path="/SignIn" component={SignInForm} />
          <Route path="/HomePage" component={HomePage} />
          {/* <Route exact path="/HomePage/Dashboard" component={ProfileContainer} /> */}
        </Switch>
      </div>
    </Provider>
    // <PasswordGenerator />
  );
}

export default App;
