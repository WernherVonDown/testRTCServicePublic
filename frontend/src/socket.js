import socketIOClient from "socket.io-client";
//require('dotenv').config()

console.log(process.env)

export const socket = socketIOClient(`http://${process.env.REACT_APP_SOCKET_SERVER_IP}`);