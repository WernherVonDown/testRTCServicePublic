import 'dotenv/config';
import sessionManager from './sessionManager';
import emitter from './subscribers/emitter';

class roomManager {
    auth_pass: string = process.env.AUTH_PASSWORD;;
    users: any[] = [];
    roomName: string = 'main';

    subscribe(client: any): void {
        client.on('verifyPassword', this.onJoinRoom.bind(this, client));
        client.on('disconnect', this.onUserDisconnect.bind(this, client));
    }

    getRoomName(): string {
        return this.roomName;
    }

    onUserDisconnect(client: any): void {
        this.users = this.users.filter(u => u.id !== client.id);
        if (this.users.length) {
            sessionManager.onUserDisconnect(client, this.users[0])
        } else {
            sessionManager.stopSession(client);
        }
    }

    onJoinRoom(client: any, password: string): void {
        const passIsCorrect: boolean = password === this.auth_pass;
        emitter.emit('socket:sendToUser', client.id, 'logged', passIsCorrect);
        if (passIsCorrect) {
            this.users.push(client);
            client.join(this.roomName);
            sessionManager.onUserJoined(client, this.roomName)
        }
    }
}

export = new roomManager();