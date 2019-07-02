import React, { Component } from "react";

import {
  AutoComplete, Select,
  Upload, Modal, Spin, Table,
  DatePicker, Popover, TextArea,
  Form, Input, Card, Alert,
  Typography, Row, Col,
  Affix, Layout, Badge, Divider,
  notification, Icon, Progress,
  Steps, Button, message
} from 'antd';
import 'antd/dist/antd.css';

const { Title, Text } = Typography;
const Option = Select.Option;

const dataSource = [
  {
    key: '1',
    name: 'John Appleseed',
    accountType: 'Portal Admin',
    email: 'example@willings.co.jp'
  },
  {
    key: '2',
    name: 'Megan Carlay (pending)',
    accountType: 'Team Member',
    email: 'example@willings.co.jp'
  },
  {
    key: '3',
    name: 'Toyo Machida',
    accountType: 'Portal Admin',
    email: 'example@willings.co.jp'
  },
];

const columns = [
  {
    title: 'Members',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Role',
    dataIndex: 'accountType',
    key: 'role',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Action',
    key: 'action',
    render: () => (
      <span>
        <Icon type="edit" style={{ cursor: 'pointer' }} />
        <Divider type="vertical" />
        <Icon type="delete" style={{ cursor: 'pointer' }} />
      </span>
    ),
  },
];
class TeamMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      candidate: {},
    };

  }


  render() {

    return (
      <Card title="Team Member" extra={<Button type="primary" icon="plus">Add new member</Button>}>
        <Row>
          <Col lg={4}></Col>
          <Col lg={16}>
            <Table columns={columns} dataSource={dataSource} />
          </Col>
          <Col lg={4}></Col>
        </Row>
      </Card>

    )
  }
}


export default TeamMember;

