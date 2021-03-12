import React, { Component } from 'react';
import LoginForm from './LoginForm';
// import { setCookie } from '../../cookieHelper.js'
import { socket } from '../../socket';

class Login extends Component {

    componentDidMount() {
      //  socket.emit('verifyPassword', '123');
    }

    verifyPassword(password) {
        socket.emit('verifyPassword', password);
    }
    render() {
        return (
            <LoginForm verifyPassword={this.verifyPassword}/>
        );
    };
}
export default Login
