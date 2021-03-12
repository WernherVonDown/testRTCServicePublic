import React, { Component } from 'react';
import './App.css';
import Login from './components/Login'
import MainPage from './components/MainPage'
// import { setCookie } from '../../cookieHelper.js'
import { socket } from './socket';

class App extends Component {
  state = {
    logged: false
  }

  componentDidMount() {
    this.subscribe()
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  subscribe () {
    socket.on('logged', this.setLogged)
  }

  unsubscribe() {
    socket.off('logged', this.setLogged)
  }

  setLogged = (logged) => {
    this.setState({logged});
  }

  render() {
    const {logged} = this.state;
    if(logged) return <MainPage/>
      return (
        <Login/>
      );
  };
}

export default App;
