import React, { Component } from "react";
import { connect } from 'react-redux';
import {
    getCompanyDetails,
    addCompanyDetails,
    updateCompanyDetails
} from '../../../../Actions/companyActions';
import PropTypes from 'prop-types';
import imgloader from '../../../../assets/images/imgloader.gif'
import uuid from 'uuid';

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

const { TextArea } = Input;
const { Title, Text } = Typography;
const Option = Select.Option;


const emailRegEx = RegExp(
    /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
);
class CompanyProfile extends Component {
    state = {
        company: this.props.company.company,
        errCompanyName: { status: '', msg: '' },
        errCompanyEmail: { status: '', msg: '' },
        newCompanyName: "",
        newCompanyEmail: "",
        newCompanyDescription: "",
        newComapanyDo: "",
        newCompanyWebsite: "",
        newCompanyAddress: "",
        newCompanyFounder: "",
        newCompanySize: "",
        newCompanyIndustry: "",
        newCompanyLogo: null,
        newCompanyLogoURL: "",
        errNewCompanyName: { status: '', msg: '' },
        errNewCompanyEmail: { status: '', msg: '' },
        companyProfileEdit: false,
        loading: false,
        imageloading: false
    };
    validateNewRequiredFields = () => {
        let flag = true;
        this.setState({
            errNewCompanyName: { status: '', msg: '' },
            errNewCompanyEmail: { status: '', msg: '' },
        });
        if (!this.state.newCompanyName) {

            this.setState({
                errNewCompanyName: { status: 'error', msg: 'Please enter your company name.' }
            });
            flag = false;
        }

        if (!emailRegEx.test(this.state.newCompanyEmail)) {
            this.setState({
                errNewCompanyEmail: { status: 'error', msg: 'Please enter your company E-Mail.' }
            });
            flag = false;
        }
        return flag;
    }
    addCompanyDetails = (e) => {
        e.preventDefault();
        if (this.validateNewRequiredFields()) {
            const newCompany = {
                id: uuid(),
                name: this.state.newCompanyName,
                email: this.state.newCompanyEmail,
                website: this.state.newCompanyWebsite,
                do: this.state.newComapanyDo,
                description: this.state.newCompanyDescription,
                address: this.state.newCompanyAddress,
                founder: this.state.newCompanyFounder,
                size: this.state.newCompanySize,
                industry: this.state.newCompanyIndustry,
                logo: this.state.newCompanyLogoURL,
                logoObject: this.state.newCompanyLogo,
                jobPostings: [],
                shortListedStudents: [],
                shortListedStudentsToInterview: [],
                accountUserList: [
                    {
                        id: sessionStorage.getItem('userID'),
                        role: "Admin",
                        email: this.props.user.user.email,
                        approvalStatus: "Approved"
                    }
                ],
                points: null
            }
            this.props.addCompanyDetails(newCompany);
            this.setState({ company: newCompany });
        }
    }
    validateRequiredFields = () => {
        let flag = true;
        this.setState({
            errCompanyName: { status: '', msg: '' },
            errCompanyEmail: { status: '', msg: '' },
        });
        if (!this.state.company.name) {

            this.setState({
                errCompanyName: { status: 'error', msg: 'Please enter your company name.' }
            });
            flag = false;
        }

        if (!emailRegEx.test(this.state.company.email)) {
            this.setState({
                errCompanyEmail: { status: 'error', msg: 'Please enter your company E-Mail.' }
            });
            flag = false;
        }
        return flag;
    }
    saveCompanyData = (e) => {
        e.preventDefault();
        if (this.validateRequiredFields()) {
            const _company = {
                id: this.state.company.id,
                name: this.state.company.name,
                email: this.state.company.email,
                website: this.state.company.website,
                do: this.state.company.do,
                description: this.state.company.description,
                address: this.state.company.address,
                founder: this.state.company.founder,
                size: this.state.company.size,
                industry: this.state.company.industry,
                logo: this.state.company.logo,
                logoObject: this.state.company.logoObject,

            }
            this.props.updateCompanyDetails(_company);
        }
        this.setState({ companyProfileEdit: false });
    }
    componentWillMount() {
        if (this.props.user.user.companyProfileComplete)
            this.setState({ compnay: this.props.company.company })
    }
    handleBeforeImageUpload = (file) => {
        const isJPG = file.type === 'image/jpeg';
        if (!isJPG) {
            message.error('You can only upload JPG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJPG && isLt2M;
    }
    handleNewImageUploadChange = (info) => {
        if (info.file.status === 'uploading') {
            this.setState({
                imageloading: true
            });
            return;
        }
        if (info.file.status === 'done') {

            let file = info.file.originFileObj;
            var reader = new FileReader();
            reader.onloadend = () => {
                this.setState({
                    newCompanyLogo: file,
                    newCompanyLogoURL: reader.result,
                    imageloading: false
                });
            };
            reader.readAsDataURL(info.file.originFileObj);
        }

    }
    onchangeNewCompanyField = (e) => {
        if (e.target.name === 'newCompanyName') {
            if (e.target.value) {
                if (e.target.value.length < 2) {
                    this.setState({
                        errNewCompanyName: { status: 'error', msg: 'Company name should be atleast 2 chracter long.' }
                    });
                } else {
                    this.setState({
                        errNewCompanyName: { status: '', msg: '' }
                    });
                }
            }

        }
        if (e.target.name === 'newCompanyEmail') {
            if (!emailRegEx.test(e.target.value)) {
                this.setState({
                    errNewCompanyEmail: { status: 'error', msg: 'Please enter your company E-Mail in proper format.' }
                });
            }
            else {
                this.setState({
                    errNewCompanyEmail: { status: '', msg: '' }
                });
            }
        }
        this.setState({ [e.target.name]: e.target.value });
    }
    onEditClicked = () => {
        this.setState({ companyProfileEdit: true });
    }
    handleImageUploadChange = (info) => {
        if (info.file.status === 'uploading') {
            this.setState({
                imageloading: true
            });
            return;
        }
        if (info.file.status === 'done') {

            let file = info.file.originFileObj;
            var reader = new FileReader();
            reader.onloadend = () => {
                this.setState({
                    company: {
                        ...this.state.company,
                        logoObject: file,
                        logo: reader.result
                    },
                    imageloading: false
                });
            };
            reader.readAsDataURL(info.file.originFileObj);
        }

    }
    onChangeHandler = (e) => {
        if (e.target.name === 'name') {
            if (e.target.value) {
                if (e.target.value.length < 2) {
                    this.setState({
                        errCompanyName: { status: 'error', msg: 'Company name should be atleast 2 chracter long.' }
                    });
                } else {
                    this.setState({
                        errCompanyName: { status: '', msg: '' }
                    });
                }
            }

        }
        if (e.target.name === 'email') {
            if (!emailRegEx.test(e.target.value)) {
                this.setState({
                    errCompanyEmail: { status: 'error', msg: 'Please enter your company E-Mail in proper format.' }
                });
            }
            else {
                this.setState({
                    errCompanyEmail: { status: '', msg: '' }
                });
            }
        }
        this.setState({
            company: { ...this.state.company, [e.target.name]: e.target.value }
        });
    }
    render() {
        // const { company } = this.props.company;
        const uploadButton = (
            <div>
                <Icon type={this.state.imageloading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        if (this.props.user.user.companyProfileComplete) {
            return (
                <Card title="Company Profile"
                    extra={<Button type="primary" icon="form" disabled={this.state.companyProfileEdit}
                        onClick={this.onEditClicked}>Edit Information</Button>}>
                    <Row>
                        <Col lg={4}></Col>
                        <Col lg={16}>
                            <Form layout="Vertical">
                                <Form.Item label={<span className="required">Company Name</span>}
                                    validateStatus={this.state.errCompanyName.status}
                                    help={this.state.errCompanyName.msg}>
                                    <Input placeholder="input placeholder"
                                        value={this.state.company.name}
                                        disabled={!this.state.companyProfileEdit}
                                        onChange={this.onChangeHandler}
                                        name="name" />
                                </Form.Item>
                                <Form.Item label={<span className="required">Company Email</span>}
                                    validateStatus={this.state.errCompanyEmail.status}
                                    help={this.state.errCompanyEmail.msg}>
                                    <Input placeholder="input placeholder"
                                        value={this.state.company.email}
                                        disabled={!this.state.companyProfileEdit}
                                        onChange={this.onChangeHandler}
                                        name="email" />
                                </Form.Item>
                                <Form.Item label="Company Description">
                                    <TextArea rows={4}
                                        value={this.state.company.description}
                                        disabled={!this.state.companyProfileEdit}
                                        onChange={this.onChangeHandler}
                                        name="description" />
                                </Form.Item>
                                <Form.Item label="What we do">
                                    <TextArea rows={4}
                                        value={this.state.company.do}
                                        disabled={!this.state.companyProfileEdit}
                                        onChange={this.onChangeHandler}
                                        name="do" />
                                </Form.Item>
                                <Form.Item label="Website">
                                    <Input placeholder="input placeholder"
                                        value={this.state.company.website}
                                        disabled={!this.state.companyProfileEdit}
                                        onChange={this.onChangeHandler}
                                        name="website" />
                                </Form.Item>
                                <Form.Item label="Address">
                                    <Input placeholder="input placeholder"
                                        value={this.state.company.address}
                                        disabled={!this.state.companyProfileEdit}
                                        onChange={this.onChangeHandler}
                                        name="address" />
                                </Form.Item>
                                <Form.Item label="Founder">
                                    <Input placeholder="input placeholder"
                                        value={this.state.company.founder}
                                        disabled={!this.state.companyProfileEdit}
                                        onChange={this.onChangeHandler}
                                        name="founder" />
                                </Form.Item>
                                <Form.Item label="Company size">
                                    <Input placeholder="input placeholder"
                                        value={this.state.company.size}
                                        disabled={!this.state.companyProfileEdit}
                                        onChange={this.onChangeHandler}
                                        name="size" />
                                </Form.Item>
                                <Form.Item label="Industry">
                                    <Input placeholder="input placeholder"
                                        value={this.state.company.industry}
                                        disabled={!this.state.companyProfileEdit}
                                        onChange={this.onChangeHandler}
                                        name="industry" />
                                </Form.Item>
                                <Form.Item
                                    style={{ marginBottom: 5, marginTop: 5, paddingBottom: 0, textAlign: 'left' }}
                                    label="Company Logo">
                                    <div className="clearfix">
                                        <Upload
                                            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            disabled={!this.state.companyProfileEdit}                                        // onPreview={this.handleImagePreview}
                                            onChange={this.handleImageUploadChange}
                                            beforeUpload={this.handleBeforeImageUpload}
                                        >
                                            {this.state.company.logo ?
                                                <img className="profileImage" src={this.state.imageloading ? imgloader : this.state.company.logo} alt="avatar" />
                                                : uploadButton}
                                        </Upload>
                                    </div>
                                    {this.state.companyProfileEdit ?
                                        <React.Fragment>
                                            <Badge color='red' />
                                            <small><i><Text disabled>Click on the image above to upload new.</Text></i></small><br />
                                            <Badge color='red' />
                                            <small><i><Text disabled>Only JPG file less than 2 MB of size is allowed.</Text></i></small>
                                        </React.Fragment> : null
                                    }

                                </Form.Item>
                                <Divider style={{ marginBottom: 10, marginTop: 10 }} />
                                <Form.Item>
                                    <Button type="primary" block
                                        disabled={!this.state.companyProfileEdit}
                                        onClick={this.saveCompanyData}>Save</Button>
                                </Form.Item>
                            </Form>

                        </Col>
                        <Col lg={4}></Col>
                    </Row>
                </Card>
            )
        }
        else {
            return (
                <Card title={<Text type="danger">Please add your company details</Text>}>
                    <Row>
                        <Col lg={4}></Col>
                        <Col lg={16}>
                            <Form layout="Vertical">
                                <Form.Item label={<span className="required">Company Name</span>}
                                    validateStatus={this.state.errNewCompanyName.status}
                                    help={this.state.errNewCompanyName.msg}>
                                    <Input placeholder="EX: Willings. Inc"
                                        onChange={this.onchangeNewCompanyField}
                                        value={this.state.newCompanyName}
                                        name="newCompanyName" />
                                </Form.Item>
                                <Form.Item label={<span className="required">Company Email</span>}
                                    validateStatus={this.state.errNewCompanyEmail.status}
                                    help={this.state.errNewCompanyEmail.msg}>
                                    <Input placeholder="EX: example@willings.co.jp"
                                        onChange={this.onchangeNewCompanyField}
                                        value={this.state.newCompanyEmail}
                                        name="newCompanyEmail" />
                                </Form.Item>
                                <Form.Item label="Company Description">
                                    <TextArea rows={4}
                                        onChange={this.onchangeNewCompanyField}
                                        value={this.state.newCompanyDescription}
                                        name="newCompanyDescription" />
                                </Form.Item>
                                <Form.Item label="What we do">
                                    <TextArea rows={4}
                                        onChange={this.onchangeNewCompanyField}
                                        value={this.state.newComapanyDo}
                                        name="newComapanyDo" />
                                </Form.Item>
                                <Form.Item label="Website">
                                    <Input placeholder="Ex: https://mysite.com"
                                        onChange={this.onchangeNewCompanyField}
                                        value={this.state.newCompanyWebsite}
                                        name="newCompanyWebsite" />
                                </Form.Item>
                                <Form.Item label="Address">
                                    <Input placeholder="Ex: Tokyo, Japan"
                                        onChange={this.onchangeNewCompanyField}
                                        value={this.state.newCompanyAddress}
                                        name="newCompanyAddress" />
                                </Form.Item>
                                <Form.Item label="Founder">
                                    <Input placeholder="Ex: Toyo Machida"
                                        onChange={this.onchangeNewCompanyField}
                                        value={this.state.newCompanyFounder}
                                        name="newCompanyFounder" />
                                </Form.Item>
                                <Form.Item label="Company size">
                                    <Input placeholder="Ex: 2000+ Employees"
                                        onChange={this.onchangeNewCompanyField}
                                        value={this.state.newCompanySize}
                                        name="newCompanySize" />
                                </Form.Item>
                                <Form.Item label="Industry">
                                    <Input placeholder="Ex: It service provider"
                                        onChange={this.onchangeNewCompanyField}
                                        value={this.state.newCompanyIndustry}
                                        name="newCompanyIndustry" />
                                </Form.Item>
                                <Form.Item
                                    style={{ marginBottom: 5, marginTop: 5, paddingBottom: 0, textAlign: 'left' }}
                                    label="Company Logo">
                                    <div className="clearfix">
                                        <Upload
                                            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            onChange={this.handleNewImageUploadChange}
                                            beforeUpload={this.handleBeforeImageUpload}
                                        >
                                            {this.state.newCompanyLogoURL ?
                                                <img className="profileImage" src={this.state.imageloading ? imgloader : this.state.newCompanyLogoURL} alt="avatar" />
                                                : uploadButton}
                                        </Upload>
                                    </div>
                                    <React.Fragment>
                                        <Badge color='red' />
                                        <small><i><Text disabled>Click on the image above to upload new.</Text></i></small><br />
                                        <Badge color='red' />
                                        <small><i><Text disabled>Only JPG file less than 2 MB of size is allowed.</Text></i></small>
                                    </React.Fragment>

                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" onClick={this.addCompanyDetails}>ADD</Button>
                                </Form.Item>
                            </Form>

                        </Col>
                        <Col lg={4}></Col>
                    </Row>
                </Card>
            )
        }

    }
}

CompanyProfile.propTypes = {
    getCompanyDetails: PropTypes.func.isRequired,
    addCompanyDetails: PropTypes.func.isRequired,
    updateCompanyDetails: PropTypes.func.isRequired,
    company: PropTypes.object.isRequired,
    user: PropTypes.object
}

const mapStateToProps = (state) => ({
    company: state.company,
    user: state.user
})

export default connect(mapStateToProps, { getCompanyDetails, addCompanyDetails, updateCompanyDetails })(CompanyProfile);

