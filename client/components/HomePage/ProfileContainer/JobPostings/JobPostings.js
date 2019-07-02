import React, { Component } from "react";

import { connect } from 'react-redux';
import {
    getJobPostings,
    addJobPostings,
    deleteJobPostings,
    updateJobPostings
} from '../../../../Actions/companyActions';
import PropTypes from 'prop-types';
import {
    AutoComplete, Select,
    Upload, Modal, Spin, Avatar,
    DatePicker, Popover, Popconfirm,
    Form, Input, Card, Alert,
    Typography, Row, Col,
    Affix, Layout, Badge, Divider,
    notification, Icon, Progress,
    Steps, Button, message
} from 'antd';
import 'antd/dist/antd.css';

//import '../../../../assets/css/bootstrap.min.css';
import '../../../../assets/css/font-awesome.min.css';
import '../../../../assets/css/icofont.min.css';
//import '../../../../assets/css/icons.css';
import '../../../../assets/css/smp.css';
//import { jobicon } from '../../../../assets/img/jobicon.png';
const { TextArea } = Input;


const { Title, Text } = Typography;
const Option = Select.Option;

class JobPostings extends Component {
    state = {
        jobPostings: this.props.company.jobPostings,
        showModal: false,
        saveInProgress: false,
        jobEditIndx: -1,
        newTitle: "",
        newPlace: "",
        newDescription: "",
        errNewTitle: { status: '', msg: '' },
        errNewPlace: { status: '', msg: '' },
        errNewDescription: { status: '', msg: '' },
        errTitle: { status: '', msg: '' },
        errPlace: { status: '', msg: '' },
        errDescription: { status: '', msg: '' },
    };

    componentDidUpdate(prevProps) {
        if (prevProps.company !== this.props.company) {
            this.setState({
                jobPostings: this.props.company.jobPostings
            });
        }
    }
    toggle = () => {
        this.setState({
            showModal: !this.state.showModal,
            newTitle: "",
            newPlace: "",
            newDescription: "",
            errNewTitle: { status: '', msg: '' },
            errNewPlace: { status: '', msg: '' },
            errNewDescription: { status: '', msg: '' },
            errTitle: { status: '', msg: '' },
            errPlace: { status: '', msg: '' },
            errDescription: { status: '', msg: '' }
        })
    }
    validateNewJobPostingFields = () => {
        let flag = true;
        this.setState({
            errNewTitle: { status: '', msg: '' },
            errNewPlace: { status: '', msg: '' },
            errNewDescription: { status: '', msg: '' }
        });

        if (!this.state.newTitle) {
            this.setState({
                errNewTitle: { status: 'error', msg: 'Please enter Job title.' }
            });
            flag = false;
        }
        if (!this.state.newPlace) {
            this.setState({
                errNewPlace: { status: 'error', msg: 'Please enter Job place.' }
            });
            flag = false;
        }
        if (!this.state.newDescription) {
            this.setState({
                errNewDescription: { status: 'error', msg: 'Please enter Job description.' }
            });
            flag = false;
        }

        return flag;
    }
    saveNewJobPost = (e) => {
        e.preventDefault();
        if (this.validateNewJobPostingFields() && this.props.companyId) {
            const _newJob = {
                id: this.props.companyId,//to send the company id for update purpose
                title: this.state.newTitle,
                place: this.state.newPlace,
                description: this.state.newDescription,
                createdDate: Date(),
                createdById: sessionStorage.getItem('userID'),
                createdByName: this.props.user.name
            }
            this.props.addJobPostings(_newJob);
            this.toggle();
        }
    }
    handleNewJobPostChange = (e) => {
        if (e.target.name === 'newTitle') {
            if (!e.target.value)
                this.setState({
                    errNewTitle: { status: 'error', msg: 'Please enter Job title.' }
                });
            else
                this.setState({
                    errNewTitle: { status: '', msg: '' }
                });
        }
        if (e.target.name === 'newPlace') {
            if (!e.target.value)
                this.setState({
                    errNewPlace: { status: 'error', msg: 'Please enter Job place.' }
                });
            else
                this.setState({
                    errNewPlace: { status: '', msg: '' }
                });
        }
        if (e.target.name === 'newDescription') {
            if (!e.target.value)
                this.setState({
                    errNewDescription: { status: 'error', msg: 'Please enter Job description.' }
                });
            else
                this.setState({
                    errNewDescription: { status: '', msg: '' }
                });
        }
        this.setState({
            [e.target.name]: e.target.value
        });
    }
    handleDeleteJob = (index) => {
        var jobPostings = this.props.company.jobPostings.filter((item, i) => i !== index);
        const itemToDelete = {
            id: this.props.companyId,//to send the company id for update purpose
            item: jobPostings
        }

        this.props.deleteJobPostings(itemToDelete);

    };
    startJobEditing = (index) => {
        this.setState({ jobEditIndx: index });
    }
    stopJobEditing = (index) => {
        if (this.validateRequiredFields()) {
            var _updatedJobs = {
                id: this.props.company.id,
                jobPostings: this.state.jobPostings
            }
            this.props.updateJobPostings(_updatedJobs);
            this.setState({ jobEditIndx: -1 });
        }
        else {
            message.error('Please provide required information !');
        }
    }
    validateRequiredFields = () => {
        let flag = true;
        const arr = this.state.jobPostings;
        this.setState({
            errTitle: { status: '', msg: '' },
            errPlace: { status: '', msg: '' },
            errDescription: { status: '', msg: '' }
        });
        if (!arr[this.state.jobEditIndx].title) {
            this.setState({
                errTitle: { status: 'error', msg: 'Please enter Job title.' }
            });
            flag = false;
        }
        if (!arr[this.state.jobEditIndx].place) {
            this.setState({
                errPlace: { status: 'error', msg: 'Please enter Job location.' }
            });
            flag = false;
        }
        if (!arr[this.state.jobEditIndx].description) {
            this.setState({
                errDescription: { status: 'error', msg: 'Please enter Job description.' }
            });
            flag = false;
        }

        return flag;
    }
    handleJobPostChange = (e, propName, index) => {
        if (propName === 'title') {
            if (!e.target.value)
                this.setState({
                    errTitle: { status: 'error', msg: 'Please enter Job title.' }
                });
            else
                this.setState({
                    errTitle: { status: '', msg: '' }
                });
        }
        if (propName === 'place') {
            if (!e.target.value)
                this.setState({
                    errPlace: { status: 'error', msg: 'Please enter Job place.' }
                });
            else
                this.setState({
                    errPlace: { status: '', msg: '' }
                });
        }
        if (propName === 'description') {
            if (!e.target.value)
                this.setState({
                    errDescription: { status: 'error', msg: 'Please enter Job description.' }
                });
            else
                this.setState({
                    errDescription: { status: '', msg: '' }
                });
        }
        this.setState({
            jobPostings: this.state.jobPostings.map((item, j) =>
                j === index ? { ...item, [propName]: e.target.value } : item
            )
        });
    }
    render() {

        return (
            <React.Fragment>

                <Card title="Job Postings"
                    extra={<Button type="primary" icon="plus" onClick={this.toggle}>
                        Add a new Job Posting
                    </Button>}>
                    <Modal
                        title="Add new Job Postings"
                        style={{ top: 20 }}
                        onOk={this.saveNewJobPost}
                        onCancel={() => {
                            this.toggle();
                        }}
                        visible={this.state.showModal}
                        footer={[
                            <Button key="back" onClick={() => {
                                this.toggle();
                            }}>
                                Cancel
                                    </Button>,
                            <Button key="submit" type="primary"
                                loading={this.state.saveInProgress}
                                onClick={this.saveNewJobPost}>
                                Submit
                                    </Button>,
                        ]}
                    >
                        <Form layout={'vertical'}>
                            <Form.Item
                                label={<span className="required">Job Title</span>}
                                style={{ marginBottom: 5, marginTop: 5, textAlign: 'left' }}
                                validateStatus={this.state.errNewTitle.status}
                                help={this.state.errNewTitle.msg}
                            >
                                <Input
                                    placeholder="Example: UX/UI Designer"
                                    value={this.state.newTitle}
                                    name='newTitle'
                                    onChange={(e) => {
                                        this.handleNewJobPostChange(e);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                label={<span className="required">Job Location</span>}
                                style={{ marginBottom: 5, marginTop: 5, textAlign: 'left' }}
                                validateStatus={this.state.errNewPlace.status}
                                help={this.state.errNewPlace.msg}
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
                                    value={this.state.newPlace}
                                    name='newPlace'
                                    onChange={(e) => {
                                        this.handleNewJobPostChange(e);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                label={<span className="required">Job Description</span>}
                                style={{ marginBottom: 5, marginTop: 5, textAlign: 'left' }}
                                validateStatus={this.state.errNewDescription.status}
                                help={this.state.errNewDescription.msg}
                            >
                                <TextArea
                                    placeholder="Example: Job description"
                                    autosize={{ minRows: 2, maxRows: 5 }}
                                    value={this.state.newDescription}
                                    name="newDescription"
                                    onChange={(e) => {
                                        this.handleNewJobPostChange(e);
                                    }}
                                />
                            </Form.Item>
                        </Form>


                    </Modal>
                    {/* {this.props.company.jobPostings ? */}
                    {this.state.jobPostings ?
                        <React.Fragment>
                            {/* {this.props.company.jobPostings.map((job, index) => ( */}
                            {this.state.jobPostings.map((job, index) => (
                                <Card key={index} type="inner" style={{ marginTop: 10 }}>
                                    <div className="candidateROW jobList">
                                        <div className="jobUpper">
                                            {!(this.state.jobEditIndx === index) ?
                                                <React.Fragment>
                                                    <Avatar size={55} style={{ marginRight: 15, float: 'left' }} icon="bank" />
                                                    <p>{job.title}</p>
                                                    <span>This text can be removed</span>
                                                    <span className="small">
                                                        <i className="icofont-location-pin">
                                                        </i>{job.place}
                                                    </span>
                                                </React.Fragment>
                                                :
                                                <React.Fragment>
                                                    <Form layout={'vertical'}>
                                                        <Form.Item
                                                            label={<span className="required">Job Title</span>}
                                                            style={{ margin: 0, padding: 0, textAlign: 'left' }}
                                                            validateStatus={this.state.errTitle.status}
                                                            help={this.state.errTitle.msg}
                                                        >
                                                            <Input style={{ width: '60%', marginBottom: 0 }}
                                                                size="small"
                                                                value={job.title}
                                                                onChange={(e) => { this.handleJobPostChange(e, 'title', index); }}
                                                                placeholder="Job Title" />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label={<span className="required" style={{ padding: 0 }}>Job Location</span>}
                                                            style={{ margin: 0, padding: 0, textAlign: 'left' }}
                                                            validateStatus={this.state.errPlace.status}
                                                            help={this.state.errPlace.msg}
                                                        >
                                                            <Input style={{ width: '60%', marginBottom: 0 }}
                                                                size="small"
                                                                value={job.place}
                                                                onChange={(e) => { this.handleJobPostChange(e, 'place', index); }}
                                                                placeholder="Location" />
                                                        </Form.Item>
                                                        <Form.Item
                                                            label={<span className="required" >Job Description</span>}
                                                            style={{ margin: 0, padding: 0, textAlign: 'left' }}
                                                            validateStatus={this.state.errDescription.status}
                                                            help={this.state.errDescription.msg}
                                                        >
                                                            <TextArea
                                                                placeholder="Example: Job description"
                                                                autosize={{ minRows: 2, maxRows: 5 }}
                                                                value={job.description}
                                                                name="description"
                                                                onChange={(e) => { this.handleJobPostChange(e, 'description', index); }}
                                                            />
                                                        </Form.Item>
                                                    </Form>
                                                </React.Fragment>
                                            }
                                            <div className="options">
                                                {!(this.state.jobEditIndx === index) ?
                                                    <span>
                                                        <React.Fragment >
                                                            <a><i className="icofont-ui-edit" onClick={() => this.startJobEditing(index)}></i></a>
                                                        </React.Fragment>
                                                        <Popconfirm
                                                            title="Are you sure delete this entry?"
                                                            onConfirm={() => this.handleDeleteJob(index)}
                                                            // onCancel={cancel}
                                                            okText="Yes"
                                                            cancelText="No"
                                                        >
                                                            <a><i className="icofont-bin"></i></a>
                                                        </Popconfirm>
                                                    </span>
                                                    :
                                                    <span>
                                                        <a ><i className="icofont-save" onClick={() => this.stopJobEditing(index)}></i></a>
                                                    </span>
                                                }
                                            </div>
                                        </div>
                                        <div className="clearfix"></div>
                                        <div className="jobLower">
                                            {!(this.state.jobEditIndx === index) ?
                                                <p>{job.description} </p>
                                                :
                                                null
                                            }
                                            <span className="footerPost">Posted by - {job.createdByName}</span>
                                        </div>
                                        <div className="clearfix"></div>
                                    </div>
                                    <div className="clearfix"></div>
                                </Card>
                            ))}
                        </React.Fragment>
                        : <h4>Loading..</h4>
                    }
                </Card>
            </React.Fragment>
        )
    }
}
JobPostings.propTypes = {
    getJobPostings: PropTypes.func.isRequired,
    addJobPostings: PropTypes.func.isRequired,
    deleteJobPostings: PropTypes.func.isRequired,
    updateJobPostings: PropTypes.func.isRequired,
    company: PropTypes.object,
    newJob: PropTypes.object
}

const mapStateToProps = (state) => ({
    // jobPostings: state.company.company ? state.company.company.jobPostings : null,
    company: state.company.company,
    newJob: state.company.newJob,
    companyId: state.company.company ? state.company.company.id : null,
    user: state.user.user
})

export default connect(mapStateToProps,
    {
        getJobPostings,
        addJobPostings,
        deleteJobPostings,
        updateJobPostings
    })(JobPostings);

