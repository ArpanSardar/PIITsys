import React, { Component } from "react";
import bcrypt from 'bcryptjs';

class PasswordGenerator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pass: ""
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }
    click = () => {
        alert('hash start');
        bcrypt.genSalt(10, (err, salt) => {
            if (err) console.log('Error in salt generation:', err);
            bcrypt.hash(this.state.pass, salt, (err, hash) => {
                if (err) console.log('Error in salt hash:', err);
                console.log('Hashed pasword:', hash);
                alert('hash end');

            });
        });

    }

    render() {
        return (
            <form>

                <label>
                    PASSWORD:
            <input
                        name="pass"
                        value={this.state.pass}
                        onChange={this.handleInputChange} />
                </label>
                <br />
                <button onClick={this.click}>Click</button>
            </form>
        );
    }
}

export default PasswordGenerator;