const amazonController = require('./amazonController');
import emitter from './subscribers/emitter';

class botManager {
    workingBots: any[] = [];
    readyBots: any[] = [];
    settings: any = {};
    started: boolean = false;
    tasks: any[] = [];
    roomName: string = 'main';

    subscribe(client: any): void {
        client.on('botReady', this.onBotReady.bind(this, client));
        client.on('bot:planEnd', this.botPlanEndNotifyUsers);
        client.on('bot:browser:close', this.botBrowserClose.bind(this, client));
        client.on('disconnect', this.onBotDisconnect.bind(this, client));
    }

    onBotDisconnect(client: any): void {
        const remoteAddress: string = client.request.connection.remoteAddress;
        const isWorkingBot: boolean = !!this.workingBots.filter(b => b.id === client.id).length;
        const isReadyBot: boolean = !!this.readyBots.filter(b => b.id === client.id).length;

        if (isWorkingBot) {
            this.workingBots = this.workingBots.filter(b => b.id !== client.id);
            const msg: string = `Working server ${remoteAddress} disconnected!`;
            this.sendBotStateInfoToRoom(msg);
        } else if (isReadyBot) {
            this.readyBots = this.readyBots.filter(b => b.id !== client.id);
            const msg: string = `Ready server ${remoteAddress} disconnected!`;
            this.sendBotStateInfoToRoom(msg);
        }
    }

    botBrowserClose(client: any, sessionTimeEnded: boolean): void {
        const remoteAdress = client.request.connection.remoteAddress;
        const msg: string = `Session on ${remoteAdress} ended!`;
        this.sendBotStateInfoToRoom(msg);
        if (sessionTimeEnded) emitter.emit('socket:sendToRoom', this.roomName, 'info:sessionTimeEnded');
    }

    botPlanEndNotifyUsers = (): void => {
        emitter.emit('socket:sendToRoom', this.roomName, 'bot:planEnd');
    }

    stopWorkingBots(): void {
        console.log('STOP WORKING BOTS', this.workingBots.length, this.readyBots.length)
        this.workingBots.forEach(bot => {
            bot.emit('stopSession');
        });
    }

    startBotsSession(): void {
        console.log('startBotsSession', this.started, this.readyBots.length, this.settings.servers)
        if (this.started && this.readyBots.length === this.settings.servers) {
            this.readyBots.forEach((b, id) => b.emit('startSession', { settings: this.settings, tasks: this.tasks[id] }));
            this.workingBots = this.workingBots.concat(this.readyBots);
            this.readyBots = [];
        }
    }

    sendBotStateInfoToRoom(msg: string): void {
        emitter.emit('socket:sendToRoom', this.roomName, 'info:bot', msg);
    }

    onBotReady(client: any): void {
        console.log('onTotReady')
        const remoteAdress = client.request.connection.remoteAddress;
        const msg: string = `Server ${remoteAdress} is ready!`;
        this.sendBotStateInfoToRoom(msg);
        this.putReadyBot(client)
        this.startBotsSession();
    }

    putReadyBot(bot: any): void {
        this.readyBots.push(bot);
    }

    changeBotsStatus(): void {
        this.workingBots = this.readyBots;
        this.readyBots = [];
    }

    requestBots(settings, tasks): Promise<any> {
        const { serversType, servers } = settings;
        this.settings = settings;
        this.started = true;
        this.tasks = tasks;
        this.settings = settings;

        return amazonController.requestSpot(servers, serversType);
    }

    clearBotData(): void {
        this.workingBots = [];
        this.readyBots = [];
        this.settings = {};
        this.tasks = [];
        this.started = false;
    }

    cancelBots(): void {
        amazonController.cancelSpotRequest();
        this.clearBotData();
    }
}

export = new botManager();