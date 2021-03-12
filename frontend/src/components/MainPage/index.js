import React, { Component } from 'react';
import { socket } from '../../socket';
import Settings from './Settings';
import Result from './Result';
import classnames from 'classnames';
import M from 'materialize-css/dist/js/materialize.min.js'
import History from '../History'

//let settingsPageHeight = 0;

const defaultState = {
    videosEnabled: {
        // 0: [
        //     {probeId:0, num:2},
        //     {probeId:1, num:3},
        //     {probeId:2, num:2},
        //     {probeId:3, num:4},
        // ],
        // 1: [
        //     {probeId:0, num:1},
        //     {probeId:1, num:0},
        //     {probeId:2, num:2},
        //     {probeId:3, num:3},
        //     {probeId:4, num:1},
        //     {probeId:5, num:0},
        //     {probeId:6, num:2},
        //     {probeId:7, num:3},
        //     {probeId:8, num:1},
        //     {probeId:9, num:0},
        //     {probeId:10, num:2},
        //     {probeId:11, num:3},
        // ],
        // 2: [
        //     {probeId:0, num:4},
        //     {probeId:1, num:4},
        //     {probeId:2, num:4},
        //     {probeId:3, num:4},
        // ]
    },
    sessionStarted: false,
    sessionStarted: false,
    allVideosCount: 0,
    maxVideosCount: 0,
    startTimer: false,
    showResult: false,
    screenshots: {},
    isSessionOwner: true,
    chartData: [[], []]
}

class MainPage extends Component {
    state = { ...defaultState, settingsPageHeight: 0, historySessions: [
        // {
        //     sessionId: '1613148551769', 
        //     settings: {
        //     size: 1,
        //     probes: 1,
        //     pageLoadTimeout: 5,
        //     screenshotInterval: 30,
        //     connectionCheckInterval: 5,
        //     duration: 300,
        //     rooms: 1,
        //     target: 'test',
        //     servers: 2}
        // },
        // {
        //     sessionId: '1613148551723', 
        //     settings: {
        //     size: 1,
        //     probes: 1,
        //     pageLoadTimeout: 5,
        //     screenshotInterval: 30,
        //     connectionCheckInterval: 5,
        //     duration: 300,
        //     rooms: 1,
        //     target: 'test',
        //     servers: 2}
        // },
    ]};
    

    componentDidMount() {
        this.subsctibe();
        //this.getVideosEnabledData(this.state.videosEnabled);
        this.calcSettingsHeight()
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    calcSettingsHeight = () => {
        const element = document.getElementById('settingsForm');
        const settingsPageHeight = element.offsetHeight;
        this.setState({ settingsPageHeight })
    }

    getTransitionEndEventName() {
        const transitions = {
            "transition": "transitionend",
            "OTransition": "oTransitionEnd",
            "MozTransition": "transitionend",
            "WebkitTransition": "webkitTransitionEnd"
        }
        const bodyStyle = document.body.style;
        for (let transition in transitions) {
            if (bodyStyle[transition] !== undefined) {
                return transitions[transition];
            }
        }
    }

    subsctibe() {
        const transitionEndEventName = this.getTransitionEndEventName();
        const mainPageWrapper = document.getElementById('mainPageWrapper');
        socket.on('info:videosEnabled', this.getVideosEnabledData);
        socket.on('info:bot', this.informServer);
        window.addEventListener('resize', this.calcSettingsHeight);
        mainPageWrapper.addEventListener(transitionEndEventName, this.removeTransition);
        socket.on('bot:planEnd', this.setStartTimer);
        socket.on('info:sessionTimeEnded', this.sessionTimeEnded);
        socket.on('bot:screenshots', this.getScreenshots);
        socket.on('startWachingSession', this.setIsSessionOwner);
        socket.on('sessionStopped', this.setSessionStopped);
        socket.on('historySessions', this.setHistorySessions);
        socket.on('info:chartData', this.setChartData);
    }

    unsubscribe() {
        const transitionEndEventName = this.getTransitionEndEventName();
        const mainPageWrapper = document.getElementById('mainPageWrapper');
        socket.off('info:videosEnabled', this.getVideosEnabledData);
        socket.off('info:bot', this.informServer);
        window.removeEventListener('resize', this.calcSettingsHeight);
        mainPageWrapper.removeEventListener(transitionEndEventName, this.removeTransition);
        socket.off('bot:planEnd', this.setStartTimer);
        socket.off('info:sessionTimeEnded', this.sessionTimeEnded);
        socket.off('bot:screenshots', this.getScreenshots)
        socket.off('startWachingSession', this.setIsSessionOwner);
        socket.off('sessionStopped', this.setSessionStopped);
        socket.off('info:chartData', this.setChartData);
    }

    setChartData = (chartData) => {
        console.log(chartData)
        this.setState({chartData})
    }

    setHistorySessions = (historySessions) => {
        this.setState({ historySessions });
    }

    setIsSessionOwner = (isSessionOwner) => {
        console.log('setIsSessionOwner', isSessionOwner)
        this.setState({ sessionStarted: true, showResult: true, isSessionOwner });
    }

    getScreenshots = (screenshots) => {
        console.log('screenshots', screenshots)
        const screenshotsCopy = { ...this.state.screenshots };
        screenshots.forEach(s => {
            const { probeId, sessionId } = s.pageParams;
            const img = s.imgData;
            const userKey = `room${sessionId}/user${probeId}`;
            if (screenshotsCopy[userKey]) {
                screenshotsCopy[userKey].push(img);
            } else {
                screenshotsCopy[userKey] = [img];
            }
        });
        this.setState({
            screenshots: screenshotsCopy
        })
    }

    sessionTimeEnded = () => {
        this.setState({ ...defaultState })
    }

    setStartTimer = () => {
        this.setState({
            startTimer: true
        })
    }

    removeTransition = (e) => {
        if (this.state.sessionStarted) {
            e.target.classList.add('removeTransition')
        } else {
            e.target.classList.remove('removeTransition')
        }
    }

    informServer(data) {
        M.toast({ html: data })
    }

    getVideosEnabledData = (data) => {
        console.log(data)
        this.setState({ ...data })
        // console.log('getVideosEnabledData',videosEnabled)
        // const { maxVideosCount } = this.state;
        // let allVideosCount = 0;
        // const videosByRooms = {...this.state.videosEnabled};
        // console.log('videosByRooms',videosEnabled)
        // videosEnabled.forEach(({numberOfVideos, pageParams}) => {
        //     const num = numberOfVideos;
        //     const {sessionId, probeId} = pageParams;
        //     allVideosCount += num ? num : 0;

        //     if(!videosByRooms[sessionId]) {
        //         videosByRooms[sessionId] = [];
        //         videosByRooms[sessionId].push({probeId, num}) 
        //     } else {
        //         if(videosByRooms[sessionId].find(e => e.probeId === probeId)){
        //             videosByRooms[sessionId].forEach(e => {
        //                 if(e.probeId === probeId) e.num = num
        //             })
        // const newMaxVideosCount = newMax ? allVideosCount : maxVideosCount;
        // console.log('result', videosByRooms)

        // const newMax = allVideosCount > maxVideosCount;
        // const newMaxVideosCount = newMax ? allVideosCount : maxVideosCount;
        // this.setState({
        //     videosEnabled:videosByRooms,
        //     allVideosCount,
        //     maxVideosCount: newMaxVideosCount

        // })
    }

    setSessionStopped = () => {
        this.setState({ sessionStarted: false, startTimer: false })
    }

    stopSession = () => {
        socket.emit('stopSession');
        this.setSessionStopped()
    }

    startSession = (sessionSettings) => {
        socket.emit('startSession', sessionSettings);
    }

    setShowResult = () => {
        this.setState(defaultState);
    }

    requestSessionHistory = (sessionId) => {
        this.setState({showResult:true})
        socket.emit('getSessionHistory', sessionId)
    }

    render() {
        const { sessionStarted, videosEnabled, allVideosCount, maxVideosCount, settingsPageHeight, startTimer, screenshots, showResult, isSessionOwner, historySessions, chartData } = this.state;
        const mainPageWrapperStyle = showResult
            ? { top: `-${settingsPageHeight}px`, height: `calc(100% + ${settingsPageHeight}px)` }
            : { transition: 'top 0.5s ease' };

        console.log(allVideosCount, maxVideosCount)
        return (
            <div className={classnames('mainPageWrapper')} id='mainPageWrapper' style={mainPageWrapperStyle}>
                <Settings startSession={this.startSession} isSessionOwner={isSessionOwner} setShowResult={this.setShowResult} stopSession={this.stopSession} startTimer={startTimer} showResult={showResult} sessionStarted={sessionStarted} />
                {
                    // this.state.image && <img src={'data:image/png;base64,'+this.state.image} />
                }
                {
                    !showResult && <History requestSessionHistory={this.requestSessionHistory} historySessions={historySessions} />
                }
                {showResult
                    && <Result chartData={chartData} allVideosCount={allVideosCount} screenshots={screenshots} maxVideosCount={maxVideosCount} videosEnabled={videosEnabled} />}

            </div>
        )
    };
}
export default MainPage