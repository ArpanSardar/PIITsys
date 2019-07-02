import React from "react";
import Marquee from 'react-text-marquee';
import CompImg from '../../../assets/img/compantLogo.png';
import UniversityImg from '../../../assets/img/university.png';
import ProjectImg from '../../../assets/img/project.png';
import CertificateImg from '../../../assets/img/certificate.png';
import list from '../../../assets/img/list.png';
import Path from '../../../assets/img/Path.png';
import Shape from '../../../assets/img/Shape.png';
import { makeShortListed } from '../../../Actions/companyActions';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    Button, Form, FormGroup, ButtonGroup,
    Label, Input, FormText, TabContent, TabPane, Nav, NavItem, NavLink,
    ModalHeader, ModalBody, Alert, Container, Row, Col
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import classnames from 'classnames';
import { Tag, Avatar, Divider, Icon, notification } from "antd";
import "antd/dist/antd.css";

class StudentDetails extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            interviewRequestedByComopany: false,
            shortlistedByComopany: false,
            activeTab: "1"
        };
    }
    changeTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }
    checkInterviewRequestedStatus = () => {
        // firebaseService.firestore().collection("Company").get()
        //   .then((querySnapshot) => {
        //     querySnapshot.forEach((doc) => {
        //       if (doc.data().id == this.props.candidate.id) {

        //       }
        //     });


        //   });
    }

    componentDidMount() {
        if (this.props.company.shortListedStudents) {
            const a = this.props.company.shortListedStudents.map(student => {
                if (student.studentId === this.props.studentToShow.id) {
                    this.setState({ shortlistedByComopany: true });
                    return 1;
                }
            });
        }
    }


    requestInterview = () => {
        //   const sessionUID = sessionStorage.getItem('userID');
        //   let CandidateId= this.props.candidate.id;
        //   let CandidateName= this.props.candidate.name;
        //   let CandidateEmail= this.props.candidate.email;


        //   const a = firebaseService.firestore().collection("CompanyInfo").get()
        //     .then((querySnapshot) => {
        //       querySnapshot.forEach(
        //         (doc) => {
        //           if (doc.data().CompanyId == sessionUID) {
        //             var ref = firebaseService.firestore().collection("CompanyInfo").doc(doc.id);
        //             ref.update({
        //               InterviewRequestedCandidates: firebaseService.firestore.FieldValue.arrayUnion(this.props.candidate.id)
        //             }).then(() => {
        //               swal( "インタビューリクエストが \n"  + this.props.candidate.name + "さんに送信されました", '1営業日以内にOnetroチームからご連絡を差し上げます', 'success');
        //               // swal("Interview request sent to candidate: " + this.props.candidate.name, 'We will contact you soon', 'success');
        //               firebaseService.firestore().collection("CompanyInfo").where("CompanyId", "==", sessionUID)
        //               .get()
        //               .then(function(querySnapshot) {
        //                   querySnapshot.forEach(function(doc) {
        //                   var monitorData={
        //                     CompanyId:sessionUID,
        //                     companyEmail: doc.data().email,
        //                     companyName: doc.data().CompanyName,
        //                     memberName: doc.data().MemberName,
        //                     memberEmail: doc.data().MemberEmail,
        //                     CandidateId: CandidateId,
        //                     CandidateName: CandidateName,
        //                     CandidateEmail: CandidateEmail,
        //                 };
        //                 firebaseService.firestore().collection("ActivityMonitor").doc("InterviewRequest")
        //                 .update({
        //                     Requests: firebaseService.firestore.FieldValue.arrayUnion(monitorData)
        //                     });
        //                 });                   
        //               });
        //               this.setState({interviewRequestedByComopany: true});
        //             });
        //           }
        //         }
        //       );


        //     });

    }

    shortList = () => {
        if (this.props.user.companyProfileComplete && this.props.user.ownProfileComplete) {
            var shortListedStudent = {
                studentId: this.props.studentToShow.id,
                studentName: this.props.studentToShow.name,
                studentEmail: this.props.studentToShow.email,
                companyUserId: sessionStorage.getItem('userID'),
                companyUserName: this.props.user.name,
                companyUserEmail: this.props.user.email,
                date: Date()
            }
            this.props.makeShortListed(shortListedStudent);
            this.setState({ shortlistedByComopany: true });
        }
        else {
            notification.open({
                message: 'Profile not ready.',
                description:
                    'Please go to dashboard and complete your profile first.',
                duration: 0,
                icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />

            });
        }
    }

    render() {

        return (
            <React.Fragment>
                <Container>
                    <Row>
                        <Col md="9" sm="8" xs="12">
                            <div className="candidateVideo roundedBorderContainer iq-mb-20">
                                <video loop="" autoplay="" controls controlsList="nodownload">
                                    <source src={this.props.studentToShow.video}
                                        type="video/mp4">
                                    </source>&gt; Your browser does not support HTML5 video.
                    </video>
                            </div>
                            <div className="clearfix"></div>
                            <div className="candidatePersonalInfo roundedBorderContainer iq-mb-20">
                                <Row>
                                    <Col md="2">
                                        {/* <div className="profileImage">
                                            <img src={this.props.studentToShow.img} alt="avatar" />
                                        </div> */}
                                        <Avatar size={65} src={this.props.studentToShow.img} style={{ margin: 10 }} />
                                    </Col>
                                    <Col md="10">
                                        <div className="otherInfo" style={{ float: "left", marginTop: 10 }}>
                                            <div className="personalInfo">
                                                <h3>
                                                    {this.props.studentToShow.name}
                                                </h3>
                                                <p>
                                                    <i className="icofont-location-pin"></i>
                                                    {this.props.studentToShow.place}
                                                </p>
                                                <div className="clearfix"></div>
                                            </div>
                                            <div className="clearfix"></div>
                                            <div className="skillInfo">
                                                <Marquee text={<span>
                                                    {this.props.studentToShow.skills.map(skill => (
                                                        <Tag key={skill.key} color="green">{skill.label}</Tag>
                                                    ))}
                                                </span>} />
                                            </div>
                                            <div className="clearfix"></div>
                                        </div>
                                    </Col>
                                </Row>


                                <div className="clearfix"></div>
                            </div>
                            <div className="clearfix"></div>
                            <div className="candidateOtherExperience roundedBorderContainer">
                                <Nav tabs>
                                    <NavItem style={{ borderRight: "1px solid #dddddd", position: "relative" }}>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === '1' })}
                                            style={{ border: 'none', display: "block" }}
                                            onClick={() => { this.changeTab('1'); }}
                                        >
                                            Work Experience
                                    </NavLink>
                                    </NavItem>
                                    <NavItem style={{ borderRight: "1px solid #dddddd", position: "relative" }}>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === '2' })}
                                            style={{ border: 'none', display: "block" }}
                                            onClick={() => { this.changeTab('2'); }}
                                        >
                                            Education
                                    </NavLink>
                                    </NavItem>
                                    <NavItem style={{ borderRight: "1px solid #dddddd", position: "relative" }}>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === '3' })}
                                            style={{ border: 'none', display: "block" }}
                                            onClick={() => { this.changeTab('3'); }}
                                        >
                                            Projects
                                    </NavLink>
                                    </NavItem>
                                    <NavItem style={{ borderRight: "1px solid #dddddd", position: "relative" }}>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === '4' })}
                                            style={{ border: 'none', display: "block" }}
                                            onClick={() => { this.changeTab('4'); }}
                                        >
                                            Certificates
                                    </NavLink>
                                    </NavItem>
                                </Nav>
                                <div className="clearfix"></div>
                                <TabContent activeTab={this.state.activeTab}>
                                    <TabPane tabId="1">
                                        {this.props.studentToShow.workExperience.map(work => (
                                            <div className="tabBlocksRow" key={work.title}>
                                                <Row>
                                                    <Col lg="8" md="8" sm="12" xs="12" className="iq-pall rowHeaderLeft">
                                                        <img src={CompImg} alt="logo" style={{ marginRight: 5 }} />
                                                        <h3>{work.title}</h3>
                                                        <p>{work.company}</p>
                                                        <div className="clearfix"></div>
                                                    </Col>
                                                    <Col lg="4" md="4" sm="12" xs="12" className="iq-pall rowHeaderRight">
                                                        <p><i className="icofont-clock-time"></i> {work.schedule}</p>
                                                        <p><i className="icofont-location-pin"></i> {work.place}</p>
                                                    </Col>
                                                    <div className="clearfix"></div>
                                                    <div className="col-md-12 col-sm-12 col-xs-12 iq-pall">
                                                        <p className="descriptionText">
                                                            {work.description}
                                                        </p>
                                                    </div>
                                                    <div className="clearfix"></div>
                                                </Row>
                                                <Divider style={{ marginBottom: 20, marginTop: 20 }} />
                                            </div>
                                        ))}
                                    </TabPane>
                                    <TabPane tabId="2">
                                        {this.props.studentToShow.education.map(education => (
                                            <div className="tabBlocksRow" key={education.title}>
                                                <Row>
                                                    <Col lg="8" md="8" sm="12" xs="12" className="iq-pall rowHeaderLeft">
                                                        <img src={UniversityImg} alt="logo" style={{ marginRight: 5 }} />
                                                        <h3>{education.title}</h3>
                                                        <p>{education.organization}</p>
                                                        <div className="clearfix"></div>
                                                    </Col>
                                                    <Col lg="4" md="4" sm="12" xs="12" className="iq-pall rowHeaderRight">
                                                        <p><i className="icofont-clock-time"></i> {education.schedule}</p>
                                                        <p><i className="icofont-location-pin"></i> {education.place}</p>
                                                    </Col>
                                                    <div className="clearfix"></div>
                                                    <div className="col-md-12 col-sm-12 col-xs-12 iq-pall">
                                                        <p className="descriptionText">
                                                            {education.description}
                                                        </p>
                                                    </div>
                                                    <div className="clearfix"></div>
                                                </Row>
                                                <Divider style={{ marginBottom: 20, marginTop: 20 }} />
                                            </div>
                                        ))}
                                    </TabPane>
                                    <TabPane tabId="3">
                                        {this.props.studentToShow.project.map(project => (
                                            <div className="tabBlocksRow" key={project.title}>
                                                <Row>
                                                    <Col lg="8" md="8" sm="12" xs="12" className="iq-pall rowHeaderLeft">
                                                        <img src={ProjectImg} alt="logo" style={{ marginRight: 5 }} />
                                                        <h3>{project.title}</h3>
                                                        <p>{project.organization}</p>
                                                        <div className="clearfix"></div>
                                                    </Col>
                                                    <Col lg="4" md="4" sm="12" xs="12" className="iq-pall rowHeaderRight">
                                                        <p><i className="icofont-clock-time"></i> {project.schedule}</p>
                                                        <p><i className="icofont-location-pin"></i> {project.place}</p>
                                                    </Col>
                                                    <div className="clearfix"></div>
                                                    <div className="col-md-12 col-sm-12 col-xs-12 iq-pall">
                                                        <p className="descriptionText">
                                                            {project.description}
                                                        </p>
                                                    </div>
                                                    <div className="clearfix"></div>
                                                </Row>
                                                <Divider style={{ marginBottom: 20, marginTop: 20 }} />
                                            </div>
                                        ))}
                                    </TabPane>
                                    <TabPane tabId="4">
                                        {this.props.studentToShow.certificate.map(certificate => (
                                            <div className="tabBlocksRow" key={certificate.title}>
                                                <Row>
                                                    <Col lg="8" md="8" sm="12" xs="12" className="iq-pall rowHeaderLeft">
                                                        <img src={CertificateImg} alt="logo" style={{ marginRight: 5 }} />
                                                        <h3>{certificate.title}</h3>
                                                        <p>{certificate.company}</p>
                                                        <div className="clearfix"></div>
                                                    </Col>
                                                    <Col lg="4" md="4" sm="12" xs="12" className="iq-pall rowHeaderRight">
                                                        <p><i className="icofont-clock-time"></i> {certificate.schedule}</p>
                                                        <p><i className="icofont-location-pin"></i> {certificate.place}</p>
                                                    </Col>
                                                    <div className="clearfix"></div>
                                                    <div className="col-md-12 col-sm-12 col-xs-12 iq-pall">
                                                        <p className="descriptionText">
                                                            {certificate.description}
                                                        </p>
                                                    </div>
                                                    <div className="clearfix"></div>
                                                </Row>
                                                <Divider style={{ marginBottom: 20, marginTop: 20 }} />
                                            </div>
                                        ))}
                                    </TabPane>
                                </TabContent>

                            </div>
                            <div className="clearfix"></div>
                        </Col>
                        <Col md="3" sm="4" xs="12">
                            {/* <ButtonGroup> */}
                            {this.state.shortlistedByComopany ?
                                <Button color="success" block disabled>
                                    <Icon type="check" style={{ marginRight: 5 }} />Shortlisted
                                </Button>
                                :
                                <Button color="success" block onClick={this.shortList} disabled={this.state.shortlistedByComopany}>
                                    Shortlist
                            </Button>
                            }

                            {/* </ButtonGroup> */}
                            <div className="shortInfo roundedBorderContainer iq-mt-10">
                                <ul>
                                    <li>
                                        <img src={Shape} alt="shape" />
                                        <h3>--University--</h3>
                                        <p>--Subject--</p>
                                    </li>
                                    <li>
                                        <img src={Path} alt="shape" />
                                        <h3>0{this.props.studentToShow.certificate.length}</h3>
                                        <p>certificate achieved</p>
                                    </li>
                                    <li>
                                        <img src={list} alt="shape" />
                                        <h3>{this.props.studentToShow.project.length}</h3>
                                        <p>projects completed</p>
                                    </li>

                                </ul>
                            </div>
                            <div className="shortInfo roundedBorderContainer iq-mt-10">
                                <h3 style={{ fontSize: 16, textAlign: "center", marginTop: 5 }}>Expertise</h3>
                                <ul>
                                    {this.props.studentToShow.expertise.map((expertise) => (
                                        <li key={expertise}>
                                            <h3 style={{ fontSize: 14 }}>{expertise}</h3>
                                        </li>
                                    ))}

                                </ul>
                            </div>
                        </Col>
                        <div className="clearfix"></div>
                    </Row>
                </Container>
            </React.Fragment>
        );
    }
}

StudentDetails.propTypes = {
    makeShortListed: PropTypes.func.isRequired,
    company: PropTypes.object.isRequired,
    user: PropTypes.object
}

const mapStateToProps = (state) => ({
    company: state.company.company,
    user: state.user.user
})
export default connect(mapStateToProps, { makeShortListed })(StudentDetails);
