import apiManager from './apiManager';
import botManager from './botManager';
import { Settings, Task, SessionState, videosBotStat } from './interfaces';
import emitter from './subscribers/emitter';
import roomManager from './roomManager';
import sessionStorage from './sessionsStorage';

class Session {
    started: boolean = false;
    tasks: Task[][] = [];
    settings: Settings | null = null;
    ownerId: string | null = null;
    startedAt: number;
    roomName: string;
    sessionState: SessionState = {
        videosEnabled: {},
        allVideosCount: 0,
        maxVideosCount: 0
    };
    chartData: any[] = [];

    getOwnerId(): string {
        return this.ownerId;
    }

    setOwnerId(ownerId: string): void {
        this.ownerId = ownerId;
    }

    getSessionHistory(client: any, sessionId: string): void {
        const sessionHistory = sessionStorage.getSavedSessionById(sessionId);
        if (sessionHistory) {
            sessionHistory.events.forEach(({ event, data }) => {
                emitter.emit('socket:sendToUser', client.id, event, data)
            })
        }
    }

    gotScreenShot = (data: any): void => {
        this.saveAndSendBotStatsToRoom('bot:screenshots', data);
    }

    estimateVideosStat(videosEnabled: videosBotStat[]): SessionState {
        const { maxVideosCount } = this.sessionState;
        let allVideosCount = 0;
        const videosByRooms = { ...this.sessionState.videosEnabled };
        videosEnabled.forEach(({ numberOfVideos, pageParams }) => {
            const num = numberOfVideos;
            const { sessionId, probeId } = pageParams;
            allVideosCount += num ? num : 0;

            if (!videosByRooms[sessionId]) {
                videosByRooms[sessionId] = [];
                videosByRooms[sessionId].push({ probeId, num })
            } else {
                if (videosByRooms[sessionId].find(e => e.probeId === probeId)) {
                    videosByRooms[sessionId].forEach(e => {
                        if (e.probeId === probeId) e.num = num
                    })
                }
                else videosByRooms[sessionId].push({ probeId, num })
            }
        });

        const newMax = allVideosCount > maxVideosCount;
        const newMaxVideosCount = newMax ? allVideosCount : maxVideosCount;
        this.sessionState.videosEnabled = videosByRooms
        this.sessionState.allVideosCount = allVideosCount;
        this.sessionState.maxVideosCount = newMaxVideosCount;
        return this.sessionState;
    }

    getChartData(videosStat: SessionState): any[] {
        if (this.chartData.length) {
            this.chartData = [[...this.chartData[0], videosStat.allVideosCount], [...this.chartData[1], new Date().toLocaleTimeString()]];
        } else {
            this.chartData = [[videosStat.allVideosCount], [new Date().toLocaleTimeString()]]
        }

        return this.chartData;
    }

    saveAndSendBotStatsToRoom(event: string, data: any): void {
        if (!this.started) return;
        sessionStorage.putData(this.startedAt, { event, data });
        emitter.emit('socket:sendToRoom', this.roomName, event, data);
    }

    gotVideoStats = (data: videosBotStat[]): void => {
        const videosEnabled = this.estimateVideosStat(data);
        const chart = this.getChartData(videosEnabled);
        this.saveAndSendBotStatsToRoom('info:videosEnabled', videosEnabled);
        this.saveAndSendBotStatsToRoom('info:chartData', chart);
    }

    init(settings: Settings, ownerId: string, roomName: string): void {
        this.roomName = roomName;
        this.settings = settings;
        this.ownerId = ownerId;
    }

    start(): void {
        this.started = true;
        this.startedAt = Date.now();
        this.tasks = apiManager.getTasks(this.settings);
        botManager.requestBots(this.settings, this.tasks);
        botManager.startBotsSession();
        sessionStorage.createItem(this.startedAt, this.settings);
    }

    clearData() {
        this.tasks = [];
        this.settings = null;
        this.ownerId = null;
        this.sessionState = {
            videosEnabled: {},
            allVideosCount: 0,
            maxVideosCount: 0
        };
        this.chartData = [];
    }

    sendHistoryToAll(): void {
        const savedSessionsItems = sessionStorage.getHistory();
        if (savedSessionsItems.length) {
            emitter.emit('socket:sendToRoom', this.roomName, 'historySessions', savedSessionsItems)
        }
    }

    sendHistoryToClient(client: any): void {
        const savedSessionsItems = sessionStorage.getHistory()
        if (savedSessionsItems.length) {
            emitter.emit('socket:sendToUser', client.id, 'historySessions', savedSessionsItems)
        }
    }

    stop(client: any): void {
        this.started = false;
        this.sendHistoryToAll();
        emitter.emit('socket:sendToRoomButUser', client, this.roomName, 'sessionStopped', false);
        this.clearData();
        botManager.stopWorkingBots();
        botManager.cancelBots()
    }
}

export = Session;