import React, { Component } from "react";
import { Link, Redirect, Route } from "react-router-dom";
import Header from "./Header/header";
import ProfileContainer from "./ProfileContainer/ProfileContainer";
import Students from "./Students/Students";

import Footer from "./Footer/footer";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getCompanyUserDetails } from '../../Actions/companyUserActions';
import {
  AutoComplete,
  Select,
  Upload,
  Card,
  DatePicker,
  Popover,
  Form,
  Input,
  Alert,
  Spin,
  Typography,
  Row,
  Col,
  Affix,
  Layout,
  Badge,
  Divider,
  notification,
  Icon,
  Progress,
  Steps,
  Button,
  message
} from "antd";
import "antd/dist/antd.css";
const { Title, Text } = Typography;
const { Content } = Layout;
const ButtonGroup = Button.Group;

class HomePage extends Component {
  // constructor(props) {
  //   super(props);
  // }

  componentWillMount() {
    const userID = sessionStorage.getItem("userID");
    if (userID != null) {
      this.props.getCompanyUserDetails(userID);
    }
  }

  render() {
    if (sessionStorage.getItem('userID') == null) {
      return <Redirect to="/" />;
    }

    return (
      <div>
        <Header />
        <Layout className="indexLayout">
          <Row>
            {/* <Col xs={0} sm={1} md={4} lg={6}></Col> */}
            <Col xs={24} sm={24} md={24} lg={24}>
              <Content className="contentClass">

                <Route exact path="/HomePage/" component={Students} />
                <Route exact path={this.props.match.url + '/Dashboard/'} component={ProfileContainer} />

                {/* <ProfileContainer /> */}
              </Content>
            </Col>
            {/* <Col xs={0} sm={1} md={4} lg={6}></Col> */}
          </Row>
        </Layout>

        <Footer />
      </div>
    );
  }
}
HomePage.propTypes = {
  getCompanyUserDetails: PropTypes.func.isRequired,
}
// const mapStateToProps = state => ({
//   user: state.user.user
// })
export default connect(null, { getCompanyUserDetails })(HomePage);
