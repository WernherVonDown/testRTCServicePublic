import { SavedSessionEvents, Settings, SavedSessionItem, SavedSession } from './interfaces';
import redisHelper from './redisHelper';

class sessionsStorage {
    savedSessions: any = {};

    async init() {
        const items: any = await redisHelper.getSavedSessions();
        this.savedSessions = items || {}
    }

    getSavedSessions() {
        return this.savedSessions;
    }

    refreshSavedSessionsInDB() {
        redisHelper.refreshSavedSessions(this.savedSessions)
    }

    createItem(key: number, settings: Settings): void {
        this.savedSessions[key] = { settings: settings, events: [] }
        this.refreshSavedSessionsInDB()
    }

    putData(key: number, data: SavedSessionEvents): void {
        this.savedSessions[key].events.push(data);
        this.refreshSavedSessionsInDB()
    }

    getSavedSessionById(sessionId: string): SavedSession {
        return this.savedSessions[sessionId];
    }

    getHistory(): SavedSessionItem[] {
        if(!this.savedSessions) return [];
        const savedSessionsItems: SavedSessionItem[] = Object.keys(this.savedSessions).reverse().map(key => {
            return { sessionId: key, settings: this.savedSessions[key].settings }
        })
        return savedSessionsItems || [];
    }
}

export = new sessionsStorage()