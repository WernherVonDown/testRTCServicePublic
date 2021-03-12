import Session from './session';
import sessionsStorage from './sessionsStorage';
import { Settings } from './interfaces';
import emitter from './subscribers/emitter';

class sessionManager {
    session: any = new Session();

    isSessionStarted(): boolean {
        return this.session.started;
    }

    subscribe(client: any): void {
        client.on('startSession', this.startSession.bind(this, client))
        client.on('bot:videosEnabled', this.session.gotVideoStats);
        client.on('bot:screenshots', this.session.gotScreenShot);
        client.on('stopSession', this.stopSession.bind(this, client));
        client.on('getSessionHistory', this.session.getSessionHistory.bind(this, client))

    }

    startSession(client: any, sessionSettings: Settings): void {
        console.log('startSession', sessionSettings, this.session.started)
        const roomName: string = 'main';
        if (this.session.started) return;
        this.session.init(sessionSettings, client.id, roomName);
        this.session.start();
        emitter.emit('socket:sendToUser', client.id, 'startWachingSession', true);
        emitter.emit('socket:sendToRoomButUser', client, roomName, 'startWachingSession', false)
    }

    stopSession(client: any): void {
        this.session.stop(client);
    }

    onUserDisconnect(client: any, newOwnerSocket: any):void {
        if(client.id === this.session.ownerId) {
            emitter.emit('socket:sendToUser', newOwnerSocket.id, 'startWachingSession', true);
            this.session.setOwnerId(newOwnerSocket.id);
        }
    }

    onUserJoined(client: any, roomName: string): void {
        this.session.sendHistoryToClient(client)
        if (this.isSessionStarted()) {
            const canManageSession = client.id === this.session.ownerId;
            client.emit('startWachingSession', canManageSession)
        }
    }
}

export = new sessionManager();