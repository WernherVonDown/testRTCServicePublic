import { Task, Settings } from './interfaces';
import config from './config'

class ApiManager {
    isRegion: number = 28;
    env: string;

    getRoomManagerUrl(sessionId: number, probeId: number): string {
        return `http://${config.room_api_ip}/openRoom?testId=${sessionId}&userId=${probeId}&isRegion=${this.isRegion}`
    }

    getApiUrl(sessionId: number, probeId: number): Task {
        const url = this.env === 'API'
            ? this.getRoomManagerUrl(sessionId + 1, probeId + 1)
            : this.getDefaultUrl(this.getClassToken(sessionId + 1, probeId + 1, 'user' + probeId))
        return { sessionId, probeId, url };
    }

    getDefaultUrl(token: string): string {
        return `https://${this.env}-${config.site_env_url}/whiteboard.html?token=${token}`
    }

    getClassToken(roomId: number, userId: number, userName: string, isTeacher: number = 1, lessonTime: string = '120'): string {
        return Buffer.from(
            JSON.stringify({
                "userId": userId,
                "userName": userName,
                "isTeacher": isTeacher,
                "lessonName": "Lesson name",
                "couseName": "Course Name",
                "redirectUrl": `https://dev-${config.site_env_url}.com`,
                "endclassUrl": "",
                "logoSource": config.site_logo_url,
                "roomId": `${roomId}`,
                "lessonTime": lessonTime,
                "isVideo": "0", "isRecord": "1", "isBoard": "0", "isLang": "0", "isExtend": "0", "isScreenshare": "1", "isCorporate": "0", "isPrivateChat": "0", "isRecordingLayout": "0", "isWolfram": "1",
                "email": "3601226975@gmail.com"
            })
        ).toString('base64')
    }

    getTasks(options: Settings): Task[][] {
        let { probes, servers, size, target, isRegion } = options;
        this.env = target;
        this.isRegion = isRegion;
        const probesPerServer: number = Math.ceil(probes / servers);
        const serverTasks: Task[][] = [[]];
        let commonProbes: number = 0;
        let serverId: number = 0;
        for (let s: number = 0; s < size; s++) {
            for (let p: number = 0; p < size; p++) {
                if (commonProbes < probes) {
                    if (serverTasks[serverId].length < probesPerServer) {
                        serverTasks[serverId].push(this.getApiUrl(s, p));
                    } else {
                        serverId++;
                        serverTasks[serverId] = [this.getApiUrl(s, p)]
                    }
                    commonProbes++;
                } else {
                    break;
                }
            }
        }
        return serverTasks
    }
}

export = new ApiManager();