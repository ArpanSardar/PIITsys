import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { register } from '../../Actions/authActions';
import { clearErrors } from '../../Actions/errorActions';
import {
    Button, Form, FormGroup,
    Label, Input, FormText, Modal,
    ModalHeader, ModalBody, ModalFooter, Alert
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    firebaseService,
    auth, database
} from "../../Service/FirebaseConfig";
// import '../signup/style.css';
import { withRouter } from "react-router-dom";
import { Spin, notification, Icon, message } from 'antd';
import 'antd/dist/antd.css';


const emailRegEx = RegExp(
    /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
);

const formValid = (validationErrors, ...rest) => {
    let valid = true;

    Object.values(validationErrors).forEach(val => {
        val.length > 0 && (valid = false);
    });

    Object.values(rest).forEach(val => {
        val === null && (valid = false);
    });
    return valid;
};

class SignUpForm extends Component {

    state = {
        email: "",
        password: "",
        confirmPassword: "",
        error: "",
        loading: false,
        validationErrors: {
            email: "",
            password: ""
        }
    };

    static propTypes = {
        userId: PropTypes.string,
        error: PropTypes.string.isRequired,
        register: PropTypes.func.isRequired,
        clearErrors: PropTypes.func.isRequired
    }
    componentDidUpdate(prevProps) {
        // const { error, isAuthenticated } = this.props;
        // if (error !== prevProps.error) {
        //     this.setState({ error: error.msg });
        // }
        // else {
        //     this.setState({ error: "" });
        // }
        // if (isAuthenticated) {
        //     this.handleClose();
        //     this.props.history.push('/HomePage');

        // }
    }
    handleChange = (e) => {
        let target = e.target;
        let value = target.value;

        let name = target.name;

        // let validationErrors = this.state.validationErrors;
        // switch (name) {
        //     case "email":
        //         validationErrors.email = emailRegEx.test(value)
        //             ? ""
        //             : "Invalid email address";
        //         break;
        //     case "password":
        //         validationErrors.password = value.length < 5 ? "password required" : "";
        //         break;
        //     default:
        //         break;
        // }

        this.setState({
            //validationErrors,
            [name]: value
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        //if (true
        //   formValid(
        //     this.state.validationErrors,
        //     this.state.candidateName,
        //     this.state.email,
        //     this.state.password,
        //     this.state.confirmpassword
        //   )
        // ) {
        this.setState({ loading: true });
        this.props.register(this.state.email, this.state.password).then((res) => {
            console.log(res);
            this.setState({ loading: false });
            // if (this.props.error.msg) {
            //     this.props.history.push('/HomePage'); 
            // }
        });


        // auth
        //     .createUserWithEmailAndPassword(this.state.email, this.state.password)
        //     .then((u) => {
        //         let userId = u.user.uid;

        //         var docData = {
        //             id: userId,
        //             ownProfileComplete: false,
        //             companyProfileComplete: false,
        //             role: 'Admin',
        //             companyId: '',
        //             name: '',
        //             email: this.state.email,
        //             phoneNumber: '',
        //             active: true,
        //             emailVerified: true
        //         };

        //         var monitorData = {
        //             event: 'Account Registration',
        //             email: this.state.email,
        //             userId: userId,
        //             Date: new Date(),
        //         };
        //         database
        //             .collection("CompanyUserProfile")
        //             .doc(userId)
        //             .set(docData)
        //             .then(function () {
        //                 database
        //                     .collection("ActivityMonitor")
        //                     .doc("CompanyUserRegistration")
        //                     .update({
        //                         CompanyUser: firebaseService.firestore.FieldValue.arrayUnion(
        //                             monitorData
        //                         )
        //                     })
        //                     .catch(error => {
        //                     });
        //             })
        //             .then(() => {
        //                 sessionStorage.setItem("userID", u.user.uid);
        //             })
        //             .then(() => {
        //                 this.setState({ loading: false });
        //                 this.props.history.push('/HomePage');
        //             })
        //             .catch((error) => {
        //                 this.setState({ loading: false });
        //                 message.success('Registration successfully !');
        //             });
        //     })
        //     .catch((error) => {
        //         this.setState({ loading: false });
        //         console.log('Errror:',error);
        //         notification.open({
        //             message: 'Can not register',
        //             description:
        //                 'There are some error during registration. Please report this incident at example@piit.com',
        //             duration: 0,
        //             icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />
        //         });
        //     });
        // }
    }

    handleClose = () => {
        this.props.clearErrors();
        this.props.history.push("/");
    };

    render() {
        if (sessionStorage.getItem('userID') != null) {
            return <Redirect to="/HomePage" />;
        }
        return (
            <Modal isOpen={true} toggle={this.handleClose}>
                <ModalHeader toggle={this.handleClose}>Sign up</ModalHeader>
                <ModalBody style={{ padding: 20 }}>
                    {this.state.loading ?
                        <div className="signingIn">
                            <Spin size="large" style={{ color: 'red' }} />
                        </div>
                        :
                        <React.Fragment>
                            {this.state.error ? <Alert color="danger">{this.state.error}</Alert> : null}
                            <Form>
                                <FormGroup>
                                    <Label htmlFor="exampleEmail">Email</Label>
                                    <Input type="email" name="email" id="email" placeholder="email : example@piit.com" onChange={this.handleChange} />
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="examplePassword">Password</Label>
                                    <Input type="password" name="password" id="password" placeholder="password" onChange={this.handleChange} />
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="examplePassword">Confirm Password</Label>
                                    <Input type="password" name="confirmPassword" id="confirmPassword" placeholder="password" onChange={this.handleChange} />
                                </FormGroup>
                                <Button color="primary" block style={{ backgroundColor: '#008000' }} onClick={this.handleSubmit}>Sign Up</Button>
                            </Form>
                            <br />
                            <div className="d-flex">
                                <Link to="/SignIn" className="p-2" style={{ color: '#008000' }}>
                                    Have an account
                        </Link>

                                {/* <Link to="/PasswordReset" className="ml-auto p-2">
                            Terms and conditions
                        </Link> */}
                            </div>
                        </React.Fragment>
                    }
                </ModalBody>
            </Modal>
        );

    }
}

const mapStateToProps = state => ({
    userId: state.auth.userId,
    error: state.error
})
export default connect(mapStateToProps, { register, clearErrors })(withRouter(SignUpForm));
