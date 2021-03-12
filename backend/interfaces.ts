interface Settings {
    size: number,
    probes: number,
    pageLoadTimeout: number,
    screenshotInterval: number,
    connectionCheckInterval: number,
    duration: number,
    rooms: number,
    target: string,
    servers: number,
    serversType: string,
    isRegion: number
}

interface Task {
    sessionId: number,
    probeId: number,
    url: string
}

interface SessionState {
    videosEnabled: any,
    allVideosCount: number,
    maxVideosCount: number
}

interface videosBotStat {
    numberOfVideos: number,
    pageParams: {
        sessionId: number,
        probeId: number
    }
}

interface SavedSessionEvents {
    event: string,
    data: any
}

interface SavedSession {
    settings: Settings,
    events: SavedSessionEvents[]
}

interface SavedSessionItem {
    sessionId: string,
    settings: Settings
}

export {
    Settings,
    Task,
    SessionState,
    videosBotStat,
    SavedSession,
    SavedSessionEvents,
    SavedSessionItem

}