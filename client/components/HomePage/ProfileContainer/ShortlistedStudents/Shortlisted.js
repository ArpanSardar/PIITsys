import React, { Component } from "react";
import Icon from '@material-ui/core/Icon';
import {
    AutoComplete, Select,
    Upload, Modal, Spin,
    DatePicker, Popover, Tag,
    Form, Input, Card, Alert,
    Typography, Row, Col,
    Affix, Layout, Badge, Divider,
    notification, Progress,
    Steps, Button, message
} from 'antd';
import 'antd/dist/antd.css';

const { Title, Text } = Typography;
const Option = Select.Option;

class Shortlisted extends Component {
    constructor(props) {
        super(props);
        this.state = {
            candidate: {},
        };

    }


    render() {

        return (
            <React.Fragment>
                <Card>
                    <Row>
                        <Col lg={6}>
                            <div className="img-box">
                                <img alt=""
                                    src="https://www.w3schools.com/w3images/team1.jpg"
                                    className="img-responsive profilePhoto"
                                    height="15"
                                    width="40"
                                />
                                <div className="text-block">
                                    <Icon style={{fontSize:20,fontWeight:'normal'}}>card_travel</Icon>
                                    <span className="label">7+ Years</span>
                                </div>

                            </div>
                        </Col>
                        <Col lg={12} style={{ marginTop: 10, paddingLeft: 10 }}>
                            <Text block Strong><h4 style={{ marginBottom: 0 }}>Natasha Dalal</h4></Text>
                            <Text block strong type="secondary">Front End Developer</Text><br />
                            <Tag color="green">Angular</Tag>
                            <Tag color="green">Vue.Js</Tag>
                            <Tag color="green">Python</Tag>
                        </Col>
                        <Col lg={6} style={{ marginTop: 10 }}>
                            <Button type="primary" size="large" block style={{ marginBottom: 10 }}>
                                Accept
                            </Button>
                            <Button type="primary" size="large" className="ant-btn-primary-outline" block>
                                Reject
                            </Button>
                        </Col>
                    </Row>
                </Card>
                <Card>
                    <Row>
                        <Col lg={6}>
                            <div className="img-box">
                                <img alt=""
                                    src="https://www.w3schools.com/w3images/team2.jpg"
                                    className="img-responsive profilePhoto"
                                    height="15"
                                    width="40"
                                />
                                <div className="text-block">
                                    <Icon style={{fontSize:20,fontWeight:'normal'}}>card_travel</Icon>
                                    <span className="label">3+ Years</span>
                                </div>

                            </div>
                        </Col>
                        <Col lg={12} style={{ marginTop: 10, paddingLeft: 10 }}>
                            <Text block Strong><h4 style={{ marginBottom: 0 }}>Mike Dyson</h4></Text>
                            <Text block strong type="secondary">Front End Developer</Text><br />
                            <Tag color="green">Angular</Tag>
                            <Tag color="green">Vue.Js</Tag>
                            <Tag color="green">Python</Tag>
                        </Col>
                        <Col lg={6} style={{ marginTop: 10 }}>
                            <Button type="primary" size="large" block style={{ marginBottom: 10 }} disabled>
                               Accepted
                            </Button>
                            {/* <Button type="primary" className="ant-btn-primary-outline" block>
                                Reject
                            </Button> */}
                        </Col>
                    </Row>
                </Card>
                <Card>
                    <Row>
                        <Col lg={6}>
                            <div className="img-box">
                                <img alt=""
                                    src="https://www.w3schools.com/w3images/team3.jpg"
                                    className="img-responsive profilePhoto"
                                    height="15"
                                    width="40"
                                />
                                <div className="text-block">
                                    <Icon style={{fontSize:20,fontWeight:'normal'}}>card_travel</Icon>
                                    <span className="label">3+ Years</span>
                                </div>

                            </div>
                        </Col>
                        <Col lg={12} style={{ marginTop: 10, paddingLeft: 10 }}>
                            <Text block Strong><h4 style={{ marginBottom: 0 }}>Peter Paul</h4></Text>
                            <Text block strong type="secondary">Front End Developer</Text><br />
                            <Tag color="green">Angular</Tag>
                            <Tag color="green">Vue.Js</Tag>
                            <Tag color="green">Python</Tag>
                        </Col>
                        <Col lg={6} style={{ marginTop: 10 }}>
                            {/* <Button type="primary" block style={{ marginBottom: 10 }}>
                                Accept
                            </Button> */}
                            <Button type="primary" size="large" className="ant-btn-primary-outline" block disabled>
                                Rejected
                            </Button>
                        </Col>
                    </Row>
                </Card>
                <Card>
                    <Row>
                        <Col lg={6}>
                            <div className="img-box">
                                <img alt=""
                                    src="https://www.w3schools.com/w3images/team4.jpg"
                                    className="img-responsive profilePhoto"
                                    height="15"
                                    width="40"
                                />
                                <div className="text-block">
                                    <Icon style={{fontSize:20,fontWeight:'normal'}}>card_travel</Icon>
                                    <span className="label">2+ Years</span>
                                </div>

                            </div>
                        </Col>
                        <Col lg={12} style={{ marginTop: 10, paddingLeft: 10 }}>
                            <Text block Strong><h4 style={{ marginBottom: 0 }}>Ankur Sardar</h4></Text>
                            <Text block strong type="secondary">Front End Developer</Text><br />
                            <Tag color="green">Angular</Tag>
                            <Tag color="green">Vue.Js</Tag>
                            <Tag color="green">Python</Tag>
                        </Col>
                        <Col lg={6} style={{ marginTop: 10 }}>
                            <Button type="primary" size="large" block style={{ marginBottom: 10 }}>
                                Accept
                            </Button>
                            <Button type="primary" size="large" className="ant-btn-primary-outline" block>
                                Reject
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </React.Fragment>
        )
    }
}


export default Shortlisted;

