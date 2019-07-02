import React, { Component } from "react";
import { connect } from 'react-redux';
import {
    updateCompanyUserDetails,
    setOwnProfileCompleteStatus
} from '../../../../Actions/companyUserActions';
import PropTypes from 'prop-types';
import {
    AutoComplete, Select,
    Upload, Modal, Spin,
    DatePicker, Popover,
    Form, Input, Card, Alert,
    Typography, Row, Col,
    Affix, Layout, Badge, Divider,
    notification, Icon, Progress,
    Steps, Button, message
} from 'antd';
import 'antd/dist/antd.css';

const { Title, Text } = Typography;
const Option = Select.Option;

const emailRegEx = RegExp(
    /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
);
class MyAccount extends Component {
    state = {
        user: this.props.user.user,
        userProfileEdit: false,
        errUserName: { status: '', msg: '' },
        errUserEmail: { status: '', msg: '' }
    };
    componentWillMount() {
        this.setState({ user: this.props.user.user })
    }
    onEditClicked = () => {
        this.setState({ userProfileEdit: true });
    }
    onChangeHandler = (e) => {
        if (e.target.name === 'name') {
            if (e.target.value) {
                if (e.target.value.length < 2) {
                    this.setState({
                        errUserName: { status: 'error', msg: 'Your name should be atleast 2 chracter long.' }
                    });
                } else {
                    this.setState({
                        errUserName: { status: '', msg: '' }
                    });
                }
            }

        }
        if (e.target.name === 'email') {
            if (!emailRegEx.test(e.target.value)) {
                this.setState({
                    errUserEmail: { status: 'error', msg: 'Please enter your E-Mail in proper format.' }
                });
            }
            else {
                this.setState({
                    errUserEmail: { status: '', msg: '' }
                });
            }
        }
        this.setState({
            user: { ...this.state.user, [e.target.name]: e.target.value }
        });
    }
    validateRequiredFields = () => {
        let flag = true;
        this.setState({
            errUserName: { status: '', msg: '' },
            errUserEmail: { status: '', msg: '' },
        });
        if (!this.state.user.name) {

            this.setState({
                errUserName: { status: 'error', msg: 'Please enter your name.' }
            });
            flag = false;
        }

        if (!emailRegEx.test(this.state.user.email)) {
            this.setState({
                errUserEmail: { status: 'error', msg: 'Please enter your E-Mail.' }
            });
            flag = false;
        }
        return flag;
    }
    updateUserDetails = (e) => {
        e.preventDefault();
        if (this.validateRequiredFields()) {
            const _user = {
                id: sessionStorage.getItem('userID'),
                name: this.state.user.name,
                email: this.state.user.email,
                phoneNumber: this.state.user.phoneNumber,
                ownProfileComplete: true
            }
            this.props.updateCompanyUserDetails(_user);
        }
        this.setState({ userProfileEdit: false });
    }
    render() {

        return (

            <Card title="My Accounts"
                extra={<Button type="primary" icon="form" disabled={this.state.userProfileEdit}
                    onClick={this.onEditClicked}>Edit Information</Button>}>
                <Row>
                    <Col lg={4}></Col>
                    <Col lg={16}>
                        <Form layout="Vertical">
                            <Form.Item label={<span className="required">Member's name handling this account</span>}
                                validateStatus={this.state.errUserName.status}
                                help={this.state.errUserName.msg}>
                                <Input placeholder="Ex: John Doe"
                                    value={this.state.user.name}
                                    onChange={this.onChangeHandler}
                                    disabled={!this.state.userProfileEdit}
                                    name="name" />
                            </Form.Item>
                            <Form.Item label={<span className="required">Member's E-mail</span>}
                                validateStatus={this.state.errUserEmail.status}
                                help={this.state.errUserEmail.msg}>
                                <Input placeholder="Ex: jondoe@example.com"
                                    value={this.state.user.email}
                                    onChange={this.onChangeHandler}
                                    disabled={!this.state.userProfileEdit}
                                    name="email" />
                            </Form.Item>
                            <Form.Item label="Member's phone number (optional)">
                                <Input placeholder="input placeholder"
                                    value={this.state.user.phoneNumber}
                                    onChange={this.onChangeHandler}
                                    disabled={!this.state.userProfileEdit}
                                    name="phoneNumber"
                                />
                            </Form.Item>
                            <Divider style={{ marginBottom: 20, marginTop: 20 }} />
                            <Form.Item>
                                <Button type="primary" block
                                    disabled={!this.state.userProfileEdit}
                                    onClick={this.updateUserDetails}>Save</Button>                            </Form.Item>
                        </Form>

                    </Col>
                    <Col lg={4}></Col>
                </Row>
            </Card>
        )
    }
}

MyAccount.propTypes = {
    updateCompanyUserDetails: PropTypes.func.isRequired,
    setOwnProfileCompleteStatus: PropTypes.func.isRequired,
    user: PropTypes.object
}

const mapStateToProps = (state) => ({
    user: state.user
})
export default connect(mapStateToProps, { updateCompanyUserDetails, setOwnProfileCompleteStatus })(MyAccount);

