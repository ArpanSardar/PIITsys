import React, { Component } from "react";
import { Link, Redirect, Route } from "react-router-dom";
import StudentDetails from "./StudentDetails";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getAllStudents } from '../../../Actions/studentActions';
import Marquee from 'react-text-marquee';
// import CandidateImg from '../../../assets/images/candidates-grid-thumb-7.jpg';
import Modal from "react-modal";
import {
    Button, Form, FormGroup,
    Label, Input, FormText,
    ModalHeader, ModalBody, Alert, Container, Row, Col
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    AutoComplete,
    Select,
    Upload,
    Card,
    DatePicker,
    Popover,
    // Form,
    // Input,
    // Alert,
    Spin,
    Typography,
    // Row,
    // Col,
    Affix,
    Layout,
    Badge,
    Divider,
    notification,
    Icon,
    Progress,
    Steps,
    // Button,
    message,
    Tag
} from "antd";
import "antd/dist/antd.css";

const { Title, Text } = Typography;
const { Content } = Layout;
const ButtonGroup = Button.Group;
const customStyles = {
    content: {
        top: "10%",
        left: "15%",
        right: "15%",
        bottom: "5%"
    }
};
class Students extends Component {
    // constructor(props) {
    //   super(props);
    // }
    state = {
        studentToShow: {},
        studentToShowClicked: false
    }
    componentWillMount() {
        this.props.getAllStudents();
    }

    // transferData = () => {

    //     oldDatabase
    //         .collection("CandidateInfo")
    //         .where("id", "==", "MZbz8O53AvUy168ZLjzbMOXCPxT2")
    //         .get()
    //         .then(querySnapshot => {
    //             querySnapshot.forEach(doc => {
    //                 var data = doc.data();

    //                 database
    //                     .collection("StudentProfile")
    //                     .doc("MZbz8O53AvUy168ZLjzbMOXCPxT2")
    //                     .set(data)
    //                     .then(() => { message.success("Data transfered.") })
    //                     .catch((err) => {
    //                         message.error("err");
    //                     });
    //             });
    //         });
    // }

    onStudentDetailsClicked = student => {
        this.setState({
            studentToShow: student,
            studentToShowClicked: true
        })
    }
    handleClose = () => {
        this.setState({
            studentToShowClicked: false
        });
    };
    render() {
        if (sessionStorage.getItem('userID') == null) {
            return <Redirect to="/" />;
        }

        return (
            <div style={{backgroundColor: 'white'}}>
                {/* <Button onClick={this.transferData} size="large">Transfer Data</Button> */}
                {/* <section className="section_search">
                    <Container>
                        <Row>
                            <Col md={{ size: 6, offset: 3 }} sm="12" xs="12">
                                <Col md="12" lg="12" sm="12" xs="12" className="searchContainer">
                                    <div className="element-title">
                                        <h1 className="title">Let's find your most suitable candidate</h1>
                                        <p className="sub-title">Find the perfect candidate for your company</p>
                                    </div>
                                    <div className="main-search classic">
                                        <Form action="" method="POST">
                                            <span className="searchIcon"><i className="fa fa-search" aria-hidden="true"></i></span>
                                            <Input type="text" placeholder="Eg : Software Engineer" className="inputBox" autocomplete="off" />
                                            <Input type="submit" className="searchBtn" value="Search" />
                                        </Form>
                                    </div>
                                </Col>
                            </Col>
                        </Row>
                    </Container>
                </section> */}
                <section className="section_candidate">
                    <div className="customeContainer">
                        <Row>
                            <Col md="12" sm="12" xs="12">
                                {/* {sessionStorage.getItem("accoountType") === true ?
                                    <h4 className="title_text">All Positions</h4> :
                                    <h4 className="title_text hazy">All Positions</h4>
                                } */}
                                <h4 className="title_text">All Students</h4>
                            </Col>

                            <div className="clearfix"></div>
                            <Col md="12" sm="12" xs="12">
                                <div className="listContainer">
                                    {this.props.students.length > 0 ?
                                        <ul>
                                            {this.props.students.map(student => (

                                                <li id={student.id} className="candidateGridPadding">
                                                    <div className="candiateGrid" style={{ margin: 3 }}>
                                                        <figure>
                                                            <a className="candidate_thumb" href="javascript:void(0)"
                                                                onClick={() => this.onStudentDetailsClicked(student)}>
                                                                <img src={student.img} alt="profile pic" />
                                                                <span className="experience">
                                                                    <i className="icofont-bag-alt"></i>{student.experience}
                                                                </span>
                                                            </a>
                                                            <figcaption>
                                                                <h2>{student.name}</h2>
                                                            </figcaption>
                                                        </figure>
                                                        <div className="clearfix"></div>
                                                        <div className="">
                                                            <Marquee text={<span>
                                                                {student.skills.map(skill => (
                                                                    <Tag key={skill.key} color="green">{skill.label}</Tag>
                                                                ))}
                                                            </span>} />
                                                            <div className="clearfix"></div>
                                                        </div>
                                                        <p><i className="icofont-location-pin"></i>{student.place}</p>
                                                        <div className="clearfix"></div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        :
                                        <h1>Loading</h1>
                                    }

                                </div>
                            </Col>
                            <div className="clearfix"></div>
                        </Row>
                    </div>
                    <div className="clearfix"></div>
                </section>
                <Modal
                    isOpen={this.state.studentToShowClicked}
                    // onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.handleClose}
                    style={customStyles}
                    contentLabel="Modal"
                    ariaHideApp={false}
                >
                    <div className="close">
                        <button
                            type="button"
                            className="close"
                            aria-label="Close"
                            onClick={this.handleClose}
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <br />
                    <br />
                    <StudentDetails
                        studentToShow={this.state.studentToShow}
                    />
                </Modal>
            </div>
        );
    }
}

Students.propTypes = {
    getAllStudents: PropTypes.func.isRequired,
    students: PropTypes.object
}
const mapStateToProps = state => ({
    students: state.students.allStudents
})

export default connect(mapStateToProps, { getAllStudents })(Students);
