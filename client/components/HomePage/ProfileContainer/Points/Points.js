import React, { Component } from "react";

import {
    AutoComplete, Select,
    Upload, Modal,Spin,
    DatePicker, Popover,
    Form, Input,Card,Alert,
    Typography, Row, Col,
    Affix, Layout, Badge, Divider,
    notification, Icon, Progress,
    Steps, Button, message
} from 'antd';
import 'antd/dist/antd.css';

const { Title, Text } = Typography;
const Option = Select.Option;

class Points extends Component {
    constructor(props) {
        super(props);
        this.state = {
            candidate: {},
            };
        
    }
   
   
    render() {
        
        return (
           <h1>In Points</h1>
        )
    }
}


export default Points;

