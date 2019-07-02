import React, { Component } from "react";
import Shortlisted from './Shortlisted';
import ToInterview from './ToInterview';

import {
    AutoComplete, Select,
    Upload, Modal,Spin,
    DatePicker, Popover,Radio,
    Form, Input,Card,Alert,
    Typography, Row, Col,
    Affix, Layout, Badge, Divider,
    notification, Icon, Progress,
    Steps, Button, message
} from 'antd';
import 'antd/dist/antd.css';

const { Title, Text } = Typography;
const Option = Select.Option;

class ShortlistedStudents extends Component {
    constructor(props) {
        super(props);
        this.state = {
            candidate: {},
            currentTab:1
            };
        
    }
    handleTabChange = e => {
        const currentTab = e.target.value;
        this.setState({ currentTab });
      };
   
    render() {
        const { currentTab } = this.state;

        return (
            <Card title="Shortlisted Students" 
            extra={
                <Radio.Group onChange={this.handleTabChange} value={currentTab}>
                <Radio.Button value={1}>Students to Interview</Radio.Button>
                <Radio.Button value={2}>Shortlisted Students</Radio.Button>
              </Radio.Group>
            }>
            <Row>
                        {
                            (() => {
                                switch (currentTab) {
                                    case 1:
                                        return (<Shortlisted/>);
                                    case 2:
                                        return (<ToInterview/>);
                                    
                                    default:
                                        return null;
                                }
                            }
                            )()
                        }
                    </Row>
                
            </Card>
        )
    }
}


export default ShortlistedStudents;

