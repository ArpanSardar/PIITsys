import React, { Component } from 'react';
import {
    Link,
    Redirect,
    withRouter,
    RouteComponentProps
} from "react-router-dom";
import Logo from "../../assets/images/logo@2x.png";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Container
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
    }
    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    onSignUpClicked = () => {
        this.props.history.push("/SignUp");
    };

    onSignInClicked = () => {
        this.props.history.push("/SignIn");
    };

    render() {
        return (
            <div>
                <Navbar color="dark" light expand="sm" className="mb-5">
                    <Container>
                        <NavbarBrand href="/">
                            <img src={Logo} alt="Logo" className="brand-logo"></img>
                        </NavbarBrand>
                        <NavbarToggler onClick={this.toggle} />
                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Nav className="ml-auto" navbar>
                                <NavItem>
                                    <NavLink onClick={this.onSignInClicked} style={{color:'#008000'}}>
                                        <strong>Login</strong>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink onClick={this.onSignUpClicked} style={{color:'#008000'}}>
                                    <strong> Register</strong>
                                    </NavLink>
                                </NavItem>
                            </Nav>
                        </Collapse>
                    </Container>
                </Navbar>
            </div>
        );

    }
}

export default withRouter(Header);