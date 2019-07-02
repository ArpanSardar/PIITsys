import React, { Component } from "react";
import TeamMembers from "./TeamMembers/TeamMembers";
import EditableFormTable from "./TeamMembers/TeamMemberAntD";
import ShortlistedStudents from "./ShortlistedStudents/ShortlistedStudents";
import Points from "./Points/Points";
import MyAccount from "./MyAccount/MyAccount";
import JobPostings from "./JobPostings/JobPostings";
import CompanyProfile from "./CompanyProfile/CompanyProfile";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getCompanyUserDetails } from '../../../Actions/companyUserActions';

import {
  Typography,
  Row,
  Col,
  Affix,
  Menu,
  Layout,
  Alert,
  Spin,
  notification,
  Icon,
  Switch,
  Card,
  Button,
  message,
  Drawer
} from "antd";
import "antd/dist/antd.css";

const { Title, Text } = Typography;

const { Header, Footer, Sider, Content } = Layout;
const ButtonGroup = Button.Group;

class ProfileContainer extends Component {
  state = {
    user: this.props.user,
    company: {},
    currentTab: 1,
    ownProfileComplete: false,
    companyProfileComplete: false,
    loading: false,
    menuDrawerVisible: false
  };

  static propTypes = {
    user: PropTypes.object,
    getCompanyUserDetails: PropTypes.func.isRequired,
  }
  componentDidUpdate(prevProps) {
    if (this.props.user !== prevProps.user) {
      if (this.props.user) {
        if (!this.props.user.companyProfileComplete) {
          this.setState({
            currentTab: 4,
          });
        }
        else if (!this.props.user.ownProfileComplete) {
          this.setState({
            currentTab: 5,
          });
        }
      }
    }
  }
  componentWillMount() {
    // const userID = sessionStorage.getItem("userID");
    // if (userID != null) {
    //   this.props.getCompanyUserDetails(userID);
    // }
  }
  componentDidMount() {
    this.setState({
      user: this.props.user
    });
  }

  showMenuDrawer = () => {
    this.setState({
      menuDrawerVisible: true
    });
  };
  onMenuDrawerClose = () => {
    this.setState({
      menuDrawerVisible: false
    });
  };
  render() {

    const { currentTab, menuDrawerVisible } = this.state;
    return (
      <Row>
        <Col xs={2} sm={0} md={0} lg={0}>
          <div>
            <Affix offsetTop={80}>
              <Button
                type="primary"
                onClick={this.showMenuDrawer}
                style={{ padding: 5, width: "100%" }}
              >
                <Icon type={!menuDrawerVisible ? "menu-unfold" : "menu-fold"} />
              </Button>
            </Affix>
            <Drawer
              // title="Basic Drawer"
              placement="left"
              closable={false}
              onClose={this.onMenuDrawerClose}
              visible={menuDrawerVisible}
            >
              <Menu
                style={{ borderTop: "1px solid #e8e8e8", paddingBottom: 20 }}
                selectedKeys={[this.state.currentTab]}
                mode="vertical"
                theme="light"
              >
                <Text strong disabled>
                  <p
                    style={{
                      marginTop: 30,
                      marginLeft: 5,
                      fontSize: 13,
                      fontWeight: 700
                    }}
                  >
                    Manage
                  </p>
                </Text>
                <Menu.Item
                  key="1"
                  onClick={() => {
                    if (this.state.companyProfileComplete && this.state.ownProfileComplete) {
                      this.setState({ currentTab: 1 });
                      this.onMenuDrawerClose();
                    }
                    else {
                      notification.open({
                        message: 'Missing information !',
                        description:
                          'Please provide information in this page before navigate to other page.',
                        duration: 0,
                        icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />
                      });
                    }
                  }}
                >
                  <Icon type="audit" />
                  Job Postings
                </Menu.Item>
                <Menu.Item
                  key="2"
                  onClick={() => {
                    if (this.state.companyProfileComplete && this.state.ownProfileComplete) {
                      this.setState({ currentTab: 2 });
                      this.onMenuDrawerClose();
                    }
                    else {
                      notification.open({
                        message: 'Missing information !',
                        description:
                          'Please provide information in this page before navigate to other page.',
                        duration: 0,
                        icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />
                      });
                    }
                  }}
                >
                  <Icon type="solution" />
                  Shortlisted Students
                </Menu.Item>
                <Menu.Item
                  key="3"
                  onClick={() => {
                    if (this.state.companyProfileComplete && this.state.ownProfileComplete) {
                      this.setState({ currentTab: 3 });
                      this.onMenuDrawerClose();
                    }
                    else {
                      notification.open({
                        message: 'Missing information !',
                        description:
                          'Please provide information in this page before navigate to other page.',
                        duration: 0,
                        icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />
                      });
                    }
                  }}
                >
                  <Icon type="team" />
                  Team Members
                </Menu.Item>
                <Text strong disabled>
                  <p
                    style={{
                      marginTop: 30,
                      marginLeft: 5,
                      fontSize: 13,
                      fontWeight: 700
                    }}
                  >
                    Account Information
                  </p>
                </Text>
                <Menu.Item
                  key="4"
                  onClick={() => {
                    this.setState({ currentTab: 4 });
                    this.onMenuDrawerClose();
                  }}
                >
                  <Icon type="bank" />
                  Company Profile
                </Menu.Item>
                <Menu.Item
                  key="5"
                  onClick={() => {
                    if (this.state.companyProfileComplete) {
                      this.setState({ currentTab: 5 });
                      this.onMenuDrawerClose();
                    }
                    else {
                      notification.open({
                        message: 'Missing information !',
                        description:
                          'Please provide information in this page before navigate to other page.',
                        duration: 0,
                        icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />
                      });
                    }
                  }}
                >
                  <Icon type="idcard" />
                  My Account
                </Menu.Item>
                <Text strong disabled>
                  <p
                    style={{
                      marginTop: 30,
                      marginLeft: 5,
                      fontSize: 13,
                      fontWeight: 700
                    }}
                  >
                    PIITs Mileage
                  </p>
                </Text>
                <Menu.Item
                  key="6"
                  onClick={() => {
                    if (this.state.companyProfileComplete && this.state.ownProfileComplete) {
                      this.setState({ currentTab: 6 });
                      this.onMenuDrawerClose();
                    }
                    else {
                      notification.open({
                        message: 'Missing information !',
                        description:
                          'Please provide information in this page before navigate to other page.',
                        duration: 0,
                        icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />
                      });
                    }
                  }}
                >
                  Points
                </Menu.Item>
              </Menu>
              <Menu
                style={{ backgroundColor: "#f0f2f5" }}
                mode="vertical"
                theme="light"
              >
                <Text strong disabled>
                  <p
                    style={{
                      marginTop: 30,
                      marginLeft: 5,
                      fontSize: 13,
                      fontWeight: 700
                    }}
                  >
                    Contact Us
                  </p>
                </Text>
                <Menu.Item
                  key="1"

                >
                  Via Email
                </Menu.Item>
                <Menu.Item
                  key="2"

                >
                  Via Phone
                </Menu.Item>
                <Menu.Item
                  key="3"

                >
                  Sign Out
                </Menu.Item>
              </Menu>
            </Drawer>
          </div>
        </Col>
        <Col xs={0} sm={4} md={6} lg={6}>
          {/* <Affix offsetTop={80}> */}
          <Menu
            style={{ borderTop: "1px solid #e8e8e8", paddingBottom: 20 }}
            defaultSelectedKeys={[this.state.currentTab.toString()]}
            selectedKeys={[this.state.currentTab.toString()]}
            mode="vertical"
            theme="light"
          >
            <Text strong disabled>
              <p
                style={{
                  marginTop: 30,
                  marginLeft: 5,
                  fontSize: 13,
                  fontWeight: 700
                }}
              >
                Manage
                </p>
            </Text>
            <Menu.Item disabled={this.props.user ? this.props.user.isLoading : true}
              key="1"
              onClick={() => {
                if (this.props.user.companyProfileComplete && this.props.user.ownProfileComplete) {
                  this.setState({ currentTab: 1 });
                  this.onMenuDrawerClose();
                }
                else {
                  notification.open({
                    message: 'Missing information !',
                    description:
                      'Please provide information in this page before navigate to other page.',
                    duration: 0,
                    icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />
                  });
                }
              }}
            >
              <Icon type="audit" />
              Job Postings
              </Menu.Item>
            <Menu.Item disabled={this.props.user ? this.props.user.isLoading : true}
              key="2"
              onClick={() => {
                if (this.props.user.companyProfileComplete && this.props.user.ownProfileComplete) {
                  this.setState({ currentTab: 2 });
                  this.onMenuDrawerClose();
                }
                else {
                  notification.open({
                    message: 'Missing information !',
                    description:
                      'Please provide information in this page before navigate to other page.',
                    duration: 0,
                    icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />
                  });
                }
              }}
            >
              <Icon type="solution" />
              Shortlisted Students
              </Menu.Item>
            <Menu.Item disabled={this.props.user ? this.props.user.isLoading : true}
              key="3"
              onClick={() => {
                if (this.props.user.companyProfileComplete && this.props.user.ownProfileComplete) {
                  this.setState({ currentTab: 3 });
                  this.onMenuDrawerClose();
                }
                else {
                  notification.open({
                    message: 'Missing information !',
                    description:
                      'Please provide information in this page before navigate to other page.',
                    duration: 0,
                    icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />
                  });
                }
              }}
            >
              <Icon type="team" />
              Team Members
              </Menu.Item>
            <Text strong disabled>
              <p
                style={{
                  marginTop: 30,
                  marginLeft: 5,
                  fontSize: 13,
                  fontWeight: 700
                }}
              >
                Account Information
                </p>
            </Text>
            <Menu.Item disabled={this.props.user ? this.props.user.isLoading : true}
              key="4"
              onClick={() => {
                this.setState({ currentTab: 4 });
              }}
            >
              <Icon type="bank" />
              Company Profile
              </Menu.Item>
            <Menu.Item disabled={this.props.user ? this.props.user.isLoading : true}
              key="5"
              onClick={() => {
                if (this.props.user.companyProfileComplete) {
                  this.setState({ currentTab: 5 });
                  this.onMenuDrawerClose();
                }
                else {
                  notification.open({
                    message: 'Missing information !',
                    description:
                      'Please provide information in this page before navigate to other page.',
                    duration: 0,
                    icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />
                  });
                }
              }}
            >
              <Icon type="idcard" />
              My Account
              </Menu.Item>
            <Text strong disabled>
              <p
                style={{
                  marginTop: 30,
                  marginLeft: 5,
                  fontSize: 13,
                  fontWeight: 700
                }}
              >
                PIITs Mileage
                </p>
            </Text>
            <Menu.Item disabled={this.props.user ? this.props.user.isLoading : true}
              key="6"
              onClick={() => {
                if (this.props.user.companyProfileComplete && this.props.user.ownProfileComplete) {
                  this.setState({ currentTab: 6 });
                  this.onMenuDrawerClose();
                }
                else {
                  notification.open({
                    message: 'Missing information !',
                    description:
                      'Please provide information in this page before navigate to other page.',
                    duration: 0,
                    icon: <Icon type="exclamation-circle" style={{ color: '#FF0000' }} />
                  });
                }
              }}
            >
              Points
              </Menu.Item>
          </Menu>

          <Menu
            style={{ backgroundColor: "#f0f2f5" }}
            mode="vertical"
            theme="light"
          >
            <Text strong disabled>
              <p
                style={{
                  marginTop: 30,
                  marginLeft: 5,
                  fontSize: 13,
                  fontWeight: 700
                }}
              >
                Contact Us
                </p>
            </Text>
            <Menu.Item
              key="1"
              onClick={() => {
                this.setState({ currentTab: 1 });
              }}
            >
              Via Email
              </Menu.Item>
            <Menu.Item
              key="2"
              onClick={() => {
                this.setState({ currentTab: 2 });
              }}
            >
              Via Phone
              </Menu.Item>
            <Menu.Item
              key="3"
              onClick={() => {
                this.setState({ currentTab: 3 });
              }}
            >
              Sign Out
              </Menu.Item>
          </Menu>
          {/* </Affix> */}
        </Col>
        <Col xs={22} sm={20} md={18} lg={18}>
          {!this.props.user ?
            <Card title={<Title level={4} style={{ marginBottom: 0, textAlign: 'center' }}>About You</Title>}>
              <Spin tip='Loading...'>
                <Alert
                  message="Please wait !!"
                  description="System is evaluating your profile."
                  type="info"
                />
              </Spin>
            </Card>
            :

            <Row>
              {(() => {
                switch (currentTab) {
                  case 1:
                    return <JobPostings />;
                  case 2:
                    return <ShortlistedStudents />;
                  case 3:
                    // return <TeamMembers />;
                    return <EditableFormTable />
                  case 4:
                    return <CompanyProfile />;
                  case 5:
                    return <MyAccount />;
                  case 6:
                    return <Points />;
                  default:
                    return null;
                }
              })()}
            </Row>
          }
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user.user
})

export default connect(mapStateToProps, { getCompanyUserDetails })(ProfileContainer);
