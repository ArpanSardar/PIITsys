import React, { Component } from "react";
import {
    Table, Input, Select, Popconfirm, Form, Button, Card, Row, Col
} from 'antd';
import 'antd/dist/antd.css';
const { Option } = Select;

const data = [];
for (let i = 0; i < 3; i++) {
    data.push({
        key: i.toString(),
        name: `Toyo Machida${i}`,
        role: 'Visitor',
        email: 'example@willings.co.jp',
    });
}
const EditableContext = React.createContext();

class EditableCell extends React.Component {
    getInput = () => {
        if (this.props.inputType === 'dropdown') {
            const select = (
                <Select defaultValue="Visitor" >
                    <Option value="Visitor">Visitor</Option>
                    <Option value="Admin">Admin</Option>
                </Select>
            );
            return select;
        }
        return <Input />;
    };

    renderCell = ({ getFieldDecorator }) => {
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            children,
            ...restProps
        } = this.props;
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item style={{ margin: 0 }}>
                        {getFieldDecorator(dataIndex, {
                            rules: [
                                {
                                    required: true,
                                    message: `Please Input ${title}!`,
                                },
                            ],
                            initialValue: record[dataIndex],
                        })(this.getInput())}
                    </Form.Item>
                ) : (
                        children
                    )}
            </td>
        );
    };

    render() {
        return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
    }
}

class EditableTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data, editingKey: '' };
        this.columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                width: '25%',
                editable: true,
            },
            {
                title: 'Role',
                dataIndex: 'role',
                width: '25%',
                editable: true,
            },
            {
                title: 'Email',
                dataIndex: 'email',
                width: '30%',
                editable: true,
            },
            {
                title: 'operation',
                dataIndex: 'operation',
                render: (text, record) => {
                    const { editingKey } = this.state;
                    const editable = this.isEditing(record);
                    return editable ? (
                        <span>
                            <EditableContext.Consumer>
                                {form => (
                                    <a
                                        href="javascript:;"
                                        onClick={() => this.save(form, record.key)}
                                        style={{ marginRight: 8 }}
                                    >
                                        Save
                  </a>
                                )}
                            </EditableContext.Consumer>
                            <Popconfirm title="Sure to cancel?" onConfirm={() => this.cancel(record.key)}>
                                <a>Cancel</a>
                            </Popconfirm>
                        </span>
                    ) : (
                            <a disabled={editingKey !== ''} onClick={() => this.edit(record.key)}>
                                Edit
            </a>
                        );
                },
            },
        ];
    }

    isEditing = record => record.key === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    save(form, key) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.data];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                this.setState({ data: newData, editingKey: '' });
            } else {
                newData.push(row);
                this.setState({ data: newData, editingKey: '' });
            }
        });
    }

    edit(key) {
        this.setState({ editingKey: key });
    }

    render() {
        const components = {
            body: {
                cell: EditableCell,
            },
        };

        const columns = this.columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: col.dataIndex === 'role' ? 'dropdown' : 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                }),
            };
        });

        return (
            <EditableContext.Provider value={this.props.form}>
                <Card title="Team Member" extra={<Button type="primary" icon="plus">Add new member</Button>}>
                    <Row>
                        <Col lg={2}></Col>
                        <Col lg={20}>
                            <Table
                                components={components}
                                // bordered
                                dataSource={this.state.data}
                                columns={columns}
                                rowClassName="editable-row"
                                pagination={{
                                    onChange: this.cancel,
                                }}
                            />
                        </Col>
                        <Col lg={2}></Col>
                    </Row>
                </Card>
            </EditableContext.Provider>
        );
    }
}

const EditableFormTable = Form.create()(EditableTable);

export default EditableFormTable;

// ReactDOM.render(<EditableFormTable />, mountNode);