import React from 'react';
import { Link, Redirect,withRouter } from "react-router-dom";

import Header from '../Header/header';


class LandingPage extends React.Component {
    render() {
      if (sessionStorage.getItem('userID')!=null) {
        return <Redirect to="/HomePage" />;
      }
      return (
        <React.Fragment>
        <Header/>
        <div className="shopping-list">
          <h1>Landing Page</h1>
          <ul>
            <li>Instagram</li>
            <li>WhatsApp</li>
            <li>Facebook</li>
          </ul>
        </div>
        </React.Fragment>
      );
    }
  }

  export default withRouter(LandingPage);