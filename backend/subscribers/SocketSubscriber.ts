const emitter = require('./emitter');

export = class SocketSubscriber {
    constructor(private io: any) {
        this.subscribe();
    }

    subscribe(): void {
        console.log('SUBSCRIBE')
        emitter.on('socket:sendToRoom', this.sendToRoom.bind(this));
        emitter.on('socket:sendToUser', this.sendToUser.bind(this));
        emitter.on('socket:sendToRoomButUser', this.sendToRoomButUser.bind(this))
    }

    sendToRoom(room: string, event: string, data: any): void {
        this.io.to(room).emit(event, data);
    };

    sendToUser(socketId: string, event: string, data: any): void {
        this.io.to(socketId).emit(event, data);
    };

    sendToRoomButUser(client: any, room: string, event, data): void {
        client.broadcast.to(room).emit(event, data)
    }
};

