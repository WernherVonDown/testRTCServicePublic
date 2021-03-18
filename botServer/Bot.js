const Page = require('./Page')
const puppeteer = require('puppeteer');

class Bot {
    constructor() {
        this.pages = [];
        this.browsers = [];
        this.enviroment = 'dev';
        this.socket = null;
        this.subscribedTimers = [];
    }

    async getPages(tasks) {
        await Promise.all(tasks.map(async ({sessionId, probeId, url}) => {
            const page = await this.getPage();
            this.pages.push(
                new Page({
                    page: page,  
                    url,
                    pageParams: {sessionId, probeId}
                })
            )
        }))
    }

    getSettings({pageLoadTimeout = 5, screenshotInterval = 60, connectionCheckInterval = 10, duration = 150}) {
        return {
            pageLoadTimeout, 
            screenshotInterval, 
            connectionCheckInterval, 
            duration};
    }

    setEnviroment (enviroment) {
        this.enviroment = enviroment;
    }

    ms(second) {
        return second * 1000;
    }

    waitSeconds(seconds){
        return new Promise(res => {
            this.subscribedTimers.push({timerId: setTimeout(res, this.ms(seconds))});
        });
    }

    allGoToUrl() {
        return Promise.all(this.pages.map(page => page.goToUrl()));
    }

    turnMicAndCameraOn(page) {
        return page.turnMicAndCameraOn()
    }

    allTurnMicAndCameraOn() {
        return Promise.all(this.pages.map(page => page.turnMicAndCameraOn()))
    }

    subscribeOnVideoCheck(interval) {
        console.log('subscribeOnVideoCheck')
        this.timerId = setInterval(async () => {
            const availableVideos = await Promise.all(this.pages.map(page => page.getNumberOfVideosEnabled()));
            this.sendToClient('bot:videosEnabled', availableVideos); 
           // console.log(availableVideos)
        },this.ms(interval))
        this.subscribedTimers.push({timerId:this.timerId, isInterval: true});
    }

    setTransportSocket(socket) {
        this.socket = socket;
    }

    sendToClient(event, data) {
        this.socket.emit(event, data);
    }

    makeScreenshots() {
        return Promise.all(this.pages.map(page => page.makeScreenshot()));
    }

    subscribeOnScreenshots(interval) {
        this.timerId = setInterval(async () => {
            const screenshots = await this.makeScreenshots();
            this.sendToClient('bot:screenshots', screenshots); 
        },this.ms(interval))
        this.subscribedTimers.push({timerId:this.timerId, isInterval: true});
    }

    async start(settings, socket) {
        const {pageLoadTimeout, screenshotInterval, connectionCheckInterval, duration} = this.getSettings(settings);
        this.setTransportSocket(socket);
        this.subscribeOnVideoCheck(connectionCheckInterval);
        this.subscribeOnScreenshots(screenshotInterval)
        console.log('START', this.pages)
        await this.allGoToUrl();
        this.sendToClient('bot:planEnd');
        this.planEnd(duration, true)
        await this.waitSeconds(pageLoadTimeout);
       // await this.allTurnMicAndCameraOn();
       await this.turnMicAndCameraOn(this.pages[0]);
    }

    async planEnd(time, sessionTimer) {
        console.log('planEnd', time)
        await this.waitSeconds(time);
        await this.closeBrowsers();
        this.subscribedTimers.forEach(timer => {
            const { isInterval, timerId } = timer;
            isInterval ? clearInterval(timerId) : clearTimeout(timerId);
        })
        this.pages = [];
        this.browsers = []
        this.sendToClient('bot:browser:close', sessionTimer);
    }

    closeBrowsers() {
        return Promise.all(this.browsers.map(b => b.close()))
    }

    getBrowser() {
        return puppeteer.launch({
            headless: true,
            args: [ '--no-sandbox',
            // '--headless',
            '--disable-setuid-sandbox',
            '--allow-hidden-media-playback',
            '--use-fake-ui-for-media-stream=1',
            '--use-fake-device-for-media-stream=1',
            '--use-file-for-fake-video-capture=cat.y4m',
            '--use-file-for-fake-audio-capture=sound.wav']})
    }

    async getPage() {
        const browser = await this.getBrowser();
        this.browsers.push(browser)
        return browser.newPage();
    }
}

module.exports = Bot;