import React, { Component } from "react";
import { connect } from 'react-redux';
import { logout } from '../../../Actions/authActions';
import PropTypes from 'prop-types';
import {
  Link,
  Redirect,
  withRouter,
  NavLink,
  RouteComponentProps
} from "react-router-dom";
import {
  firebaseService,
  auth, database
} from "../../../Service/FirebaseConfig";
import Logo from "../../../assets/images/logo@2x.png";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  // NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Avatar, Affix } from "antd";
import "antd/dist/antd.css";
import "./header.css";

class Header extends Component {
  state = {
    isOpen: false
  };
  static propTypes = {
    logout: PropTypes.func.isRequired
  }
  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };
  logout = () => {
    this.props.logout();
    // auth.signOut();
    // sessionStorage.removeItem('userID');
    this.props.history.push('/');

  };

  render() {
    return (
      <Affix>
        <Navbar color="white" light expand="sm" className="shadow-sm p-3 mb-5 bg-white rounded">
          <NavbarBrand href="/">
            <img src={Logo} alt="Logo" className="brand-logo" />
          </NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>

              <NavItem>
                <NavLink
                  exact
                  // active='true'
                  activeClassName="active"
                  // id="nav-bar-text" 
                  // href="/HomePage/"
                  to="/HomePage/"
                >
                  Students
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  // id="nav-bar-text"
                  activeClassName="active"
                  // href="/HomePage/Dashboard"
                  to="/HomePage/Dashboard"
                >
                  Dashboard
                </NavLink>
              </NavItem>
              <NavItem>
                <Avatar style={{ marginTop: 5, marginLeft: 10 }} icon="bank" />
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle
                  // id="nav-bar-text" 
                  nav caret>
                  Orfa,Inc
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem>Profile</DropdownItem>
                  <DropdownItem>Option 2</DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem onClick={this.logout}>Logout</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbar>
      </Affix>
    );
  }
}

export default connect(null, { logout })(withRouter(Header));
