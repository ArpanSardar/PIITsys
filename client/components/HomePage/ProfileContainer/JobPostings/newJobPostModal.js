import React, { Component } from "react";

// import {countries} from "../HomePage/AutoComplete/data";
import {
    AutoComplete, Select,
    Modal, Card, Alert,
    DatePicker,
    Form, Input, Popconfirm, Spin,
    Typography, Row, Col, Checkbox,
    Divider, notification, Icon, Button, message, Empty
} from 'antd';
import 'antd/dist/antd.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const Option = Select.Option;
const ButtonGroup = Button.Group;


class newJobPostModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            education: [],
            educationEditIDX: -1,
            newEducationFields: {},
            instituteName: "",
            degree: "",
            schedule: "",
            place: "",
            description: "",
            newStartDate: null,
            newEndDate: null,
            loading: true,
            saveInProgress: false,
            errDegree: { status: '', msg: '' },
            errPlace: { status: '', msg: '' },
            errDuration: { status: '', msg: '' },
            errInstituteName: { status: '', msg: '' },
            editErrDegree: { status: '', msg: '' },
            editErrPlace: { status: '', msg: '' },
            editErrDuration: { status: '', msg: '' },
            editErrInstituteName: { status: '', msg: '' },
            showModal: false
        };

    }


    handleNewEducationChange = (e, propName) => {
        //This function is the onChange event of all the fields in new Education
        if (propName == "newStartDate" || propName == "newEndDate") {
            const { value } = e.target;
            // console.log('value :',value)
            if (value.length > 1) {
                this.setState({
                    errDuration: { status: '', msg: '' }
                });
            }
            else {
                this.setState({
                    errDuration: { status: 'error', msg: 'Please enter duration in this institute.' }
                });
            }

            this.setState({
                newEducationFields: {
                    ...this.state.newEducationFields,
                    startDate: value[0] ? value[0].format('DD/MM/YYYY') : null,
                    endDate: value[1] ? value[1].format('DD/MM/YYYY') : null,
                }
            });
            this.setState({
                newStartDate: value[0] ? value[0].format('DD/MM/YYYY') : null,
                newEndDate: value[1] ? value[1].format('DD/MM/YYYY') : null,
            });
        }
        else {
            const { value } = e.target;
            if (!value) {
                if (propName === 'degree') {
                    this.setState({
                        errDegree: { status: 'error', msg: 'Please enter Academic degree.' }
                    });
                }
                if (propName === 'place') {
                    this.setState({
                        errPlace: { status: 'error', msg: 'Please enter Institute location.' }
                    });
                }
                if (propName === 'instituteName') {
                    this.setState({
                        errInstituteName: { status: 'error', msg: 'Please enter Institute Name.' }
                    });
                }
            }
            else {
                if (propName === 'degree') {
                    this.setState({
                        errDegree: { status: '', msg: '' }
                    });
                }
                if (propName === 'place') {
                    this.setState({
                        errPlace: { status: '', msg: '' }
                    });
                }
                if (propName === 'instituteName') {
                    this.setState({
                        errInstituteName: { status: '', msg: '' }
                    });
                }
            }
            this.onNewEducationFieldChange({ [propName]: value });
            this.setState({
                [propName]: value
            });
        }
    };
    onNewEducationFieldChange = (updatedValue) => {
        //This function is to create the new Education object
        this.setState({
            newEducationFields: {
                ...this.state.newEducationFields,
                ...updatedValue
            }
        });
    };

    saveNewEducation = (e) => {
        e.preventDefault();
        if (this.validateRequiredNewFields()) {
            this.setState({ saveInProgress: true });
            var newArray = this.state.education.slice();
            newArray.push(this.state.newEducationFields);
            this.setState({
                education: newArray
            });
            var candidateId = sessionStorage.getItem("candidateID");
            if (candidateId != null) {
                // companyDatabase
                //     .collection("CandidateInfo")
                //     .doc(candidateId)
                //     .update({ education: newArray })
                //     .then(() => {
                //         this.setState({ saveInProgress: false,showModal: false });
                //         message.success('Data added successfully');
                //     })
                //     .catch(function (error) {
                //         message.error('Error while adding data !');
                //     });
            }
            this.setState({
                instituteName: "",
                degree: "",
                schedule: "",
                place: "",
                description: "",
                newStartDate: null,
                newEndDate: null,
                errDegree: { status: '', msg: '' },
                errPlace: { status: '', msg: '' },
                errDuration: { status: '', msg: '' },
                errInstituteName: { status: '', msg: '' },
            });
            this.onNewEducationFieldChange({
                instituteName: "",
                degree: "",
                schedule: "",
                place: "",
                description: "",
                newStartDate: null,
                newEndDate: null,
            });
        }
        else {
            message.error('Please provide required information !');
        }
    }
    componentDidMount() {

    }
    validateRequiredNewFields = () => {
        let flag = true;
        this.setState({
            errDegree: { status: '', msg: '' },
            errPlace: { status: '', msg: '' },
            errInstituteName: { status: '', msg: '' },
            errDuration: { status: '', msg: '' }
        });

        if (!this.state.degree) {
            this.setState({
                errDegree: { status: 'error', msg: 'Please enter Academic degree.' }
            });
            flag = false;
        }
        if (!this.state.place) {
            this.setState({
                errPlace: { status: 'error', msg: 'Please enter your institute location.' }
            });
            flag = false;
        }
        if (this.state.instituteName.length === 0) {
            this.setState({
                errInstituteName: { status: 'error', msg: 'Please enter your Institute Name.' }
            });
            flag = false;
        }
        if (!this.state.newStartDate) {
            this.setState({
                errDuration: { status: 'error', msg: 'Please enter duration in this institute.' }
            });
            flag = false;
        }
        return flag;
    }


    openNotificationWithIcon = () => {
        notification.open({
            message: 'Insufficient Information',
            description:
                'Please update missing information in this page to proceed in next page.',
            duration: 0,
            icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />

        });
    }
    validateEducationInfoTab = () => {
        let flagError = false;
        if (this.state.educationEditIDX >= 0)
            flagError = true;

        if (flagError) {

            notification.open({
                message: 'Save your information',
                description:
                    'You have some unsaved data in this page. Please save before proceed to next step.',
                duration: 0,
                icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />

            });
        }
        else {
            this.props.nextStep();
        }
    }

    toggle = () => {
        this.setState({ showModal: !this.state.showModal })
    }
    render() {
        return (
            <React.Fragment>AAAAAAAAAAAAA
                <Button type="primary" icon="plus" onClick={this.toggle}>
                    Add a new Job Posting
                    </Button>
                <Modal
                    title="Add new Job Postings"
                    style={{ top: 20 }}
                    onOk={this.saveNewEducation}
                    onCancel={() => {
                        this.toggle();
                        this.setState({
                            showModal: false,
                            instituteName: "",
                            degree: "",
                            schedule: "",
                            place: "",
                            description: "",
                            newStartDate: null,
                            newEndDate: null,
                            errDegree: { status: '', msg: '' },
                            errPlace: { status: '', msg: '' },
                            errDuration: { status: '', msg: '' },
                            errInstituteName: { status: '', msg: '' },
                        });
                    }}
                    visible={this.state.showModal}
                    footer={[
                        <Button key="back" onClick={() => {
                            this.setState({
                                showModal: false,
                                instituteName: "",
                                degree: "",
                                schedule: "",
                                place: "",
                                description: "",
                                newStartDate: null,
                                newEndDate: null,
                                errDegree: { status: '', msg: '' },
                                errPlace: { status: '', msg: '' },
                                errDuration: { status: '', msg: '' },
                                errInstituteName: { status: '', msg: '' },
                            })
                        }}>
                            Cancel
                                    </Button>,
                        <Button key="submit" type="primary" loading={this.state.saveInProgress} onClick={this.saveNewEducation}>
                            Submit
                                    </Button>,
                    ]}
                >
                    <Form layout={'vertical'}>
                        <Form.Item
                            label={<span className="required">Job Title</span>}
                            style={{ marginBottom: 5, marginTop: 5, textAlign: 'left' }}
                            validateStatus={this.state.errInstituteName.status}
                            help={this.state.errInstituteName.msg}
                        >
                            <Input
                                placeholder="Example: UX/UI Designer"
                                value={this.state.instituteName}
                                name='title'
                                onChange={(e) => {
                                    this.handleNewEducationChange(e, "title");
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            label={<span className="required">Job Location</span>}
                            style={{ marginBottom: 5, marginTop: 5, textAlign: 'left' }}
                            validateStatus={this.state.errPlace.status}
                            help={this.state.errPlace.msg}
                        >
                            {/* <AutoComplete
                                    dataSource={countries}
                                    placeholder="Example: United States"
                                    id='place'
                                    value={this.state.place}
                                    onChange={(value: any) => {
                                        this.handleNewEducationChange({ target: { value: value } }, "place");
                                    }}
                                    allowClear={true}
                                    filterOption={(inputValue: any, option: any) =>
                                        option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                    }
                                /> */}
                            <Input
                                placeholder="Example: Tokyo, Japan"
                                value={this.state.instituteName}
                                name='place'
                                onChange={(e) => {
                                    this.handleNewEducationChange(e, "place");
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            label={<span className="required">Job Description</span>}
                            style={{ marginBottom: 5, marginTop: 5, textAlign: 'left' }}
                            validateStatus={this.state.errDegree.status}
                            help={this.state.errDegree.msg}
                        >
                            <TextArea
                                placeholder="Example: Enter any additional information you want to provide here like the marks or grade obtained in this degree"
                                autosize={{ minRows: 2, maxRows: 5 }}
                                value={this.state.description}
                                id="description"
                                onChange={(e) => {
                                    this.handleNewEducationChange(e, "description");
                                }}
                            />
                        </Form.Item>
                    </Form>


                </Modal>
            </React.Fragment>
        )
    }
}


export default newJobPostModal;

