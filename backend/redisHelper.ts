enum paths {
    savedSessions = 'savedSessions'
}

class redisHelper {
    db: any;

    init(redisClient: any): void {
        this.db = redisClient;
    }

    refreshSavedSessions(data): void {
        const savedSessions: string = JSON.stringify(data);
        if (savedSessions) {
            this.db.set(paths.savedSessions, savedSessions)
        }
    }

    async getSavedSessions() {
        const data = await this.db.get(paths.savedSessions);
        return JSON.parse(data);
    }
}

export = new redisHelper();