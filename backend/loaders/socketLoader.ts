const socketIo = require('socket.io');
import roomManager from '../roomManager';
import sessionManager from '../sessionManager';
import botManager from '../botManager';
import SocketSubscriber from '../subscribers/SocketSubscriber';

export = function (httpServer: any): void {
  const io: any = socketIo(httpServer, {
    cors: {
      origin: '*',
    }
  });
  initRoutes(io);
  const subscriber: any = new SocketSubscriber(io);
};

function initRoutes(io: any): void {
  io.sockets.on('connection', (client: any) => {
    roomManager.subscribe(client);
    sessionManager.subscribe(client);
    botManager.subscribe(client);
  });
}
