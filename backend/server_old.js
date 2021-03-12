const express = require('express');
const apiManager = require('./apiManager');
const app = express(); 
const server = require('http').createServer(app);
const AmazonController = require('./amazonController');
const io = require('socket.io')(server, {
        cors: {
          origin: '*',
        }
      });
server.listen(1337);

const session = {
  started: false, 
  settings: {},
  owner: '',
  startedAt: Date.now()
};

let chartData = [
  [],
  []
]

let sessionState = {
  videosEnabled:{},
  allVideosCount: 0,
  maxVideosCount: 0
}

const savedSession = {};
let readyBots = []
const roomName = 'main';
let workingBots = [];
let users = []

function clearSessionData () {
  chartData = [
    [],
    []
  ]
  sessionState = {
    videosEnabled:{},
    allVideosCount: 0,
    maxVideosCount: 0
  }
  session.started = false;
  session.settings = {};
  session.owner = '';
  AmazonController.cancelSpotRequest();
}

function estimateVideosStat (videosEnabled) {
  const { maxVideosCount } = sessionState;
  let allVideosCount = 0;
  const videosByRooms = {...sessionState.videosEnabled};
  videosEnabled.forEach(({numberOfVideos, pageParams}) => {
      const num = numberOfVideos;
      const {sessionId, probeId} = pageParams;
      allVideosCount += num ? num : 0;

      if(!videosByRooms[sessionId]) {
          videosByRooms[sessionId] = [];
          videosByRooms[sessionId].push({probeId, num}) 
      } else {
          if(videosByRooms[sessionId].find(e => e.probeId === probeId)){
              videosByRooms[sessionId].forEach(e => {
                  if(e.probeId === probeId) e.num = num
              })
          }
          else videosByRooms[sessionId].push({probeId, num})
      }
  });

  const newMax = allVideosCount > maxVideosCount;
  const newMaxVideosCount = newMax ? allVideosCount : maxVideosCount;
  sessionState.videosEnabled = videosByRooms
  sessionState.allVideosCount = allVideosCount;
  sessionState.maxVideosCount = newMaxVideosCount;
  return sessionState;
}

function startBotsSession() {
  if(session.started && readyBots.length === session.settings.servers) {
    readyBots.forEach((b, id) => b.emit('startSession',{settings: session.settings, tasks:session.tasks[id]}));
    workingBots = workingBots.concat(readyBots);
    readyBots = [];
  }
}

function getHistory() {
  const savedSessionsItems = Object.keys(savedSession).reverse().map(key => {
    return {sessionId: key, settings: savedSession[key].settings}
  });

  return savedSessionsItems || []
}

function sendHistoryToClient(client) {
  const savedSessionsItems = getHistory()
  if(savedSessionsItems.length) {
    client.emit('historySessions', savedSessionsItems)
  }
}

function sendHistoryToAll(io) {
  const savedSessionsItems = getHistory()
  if(savedSessionsItems.length) {
    io.to(roomName).emit('historySessions', savedSessionsItems)
  }
}

function getChartData(videosStat) {
  if(chartData.length) {
    chartData = [[...chartData[0], videosStat.allVideosCount], [...chartData[1], new Date().toLocaleTimeString()]];
  } else {
    chartData = [[videosStat.allVideosCount], [new Date().toLocaleTimeString()]]
  }
    
    return chartData;
}

function sendBotStatsToRoom(io, event, data) {
  if(!session.started) return;
  if(!savedSession[session.startedAt]) {
    savedSession[session.startedAt] = {settings: session.settings, events: []};
  }
  savedSession[session.startedAt].events.push({event, data});
  io.to(roomName).emit(event, data);
}

io.sockets.on('connection', client => {
    client.on('bot:videosEnabled', data => {
      const videosEnabled = estimateVideosStat(data);
      const chart = getChartData(videosEnabled)
      sendBotStatsToRoom(io, 'info:videosEnabled', videosEnabled);
      sendBotStatsToRoom(io, 'info:chartData', chart);
    })
    client.on('bot:screenshot', (data) => {
      io.to(roomName).emit('bot:screenshot', data)
    })
    client.on('verifyPassword', password => {
      const passIsCorrect = password === '123';
      client.emit('logged', passIsCorrect);
      if (passIsCorrect) {
        users.push(client);
        client.join(roomName);
        sendHistoryToClient(client);
        if (session.started) {
          const canManageSession = client.id === session.id;
          client.emit('startWachingSession', canManageSession)
        }
      } 
    })

    client.on('getSessionHistory', sessionId => {
      if(savedSession[sessionId]) {
        savedSession[sessionId].events.forEach(({event, data}) => {
          client.emit(event, data)
        })
      }
    })

    client.on('startSession', async sessionSettings => {
      if (session.started) return;
      console.log(sessionSettings)
      const {serversType, servers} = sessionSettings;
      session.started = true;
      session.settings = sessionSettings;
      session.tasks = apiManager.getTasks(sessionSettings);
      session.owner = client.id;
      session.startedAt = Date.now()
      client.emit('startWachingSession', true)
      client.broadcast.to(roomName).emit('startWachingSession', false)
      const res = await AmazonController.requestSpot(servers, serversType);
      console.log('RES', res)
      startBotsSession();
    })

    client.on('bot:planEnd', () => {
      io.to(roomName).emit('bot:planEnd');
    })

    client.on('stopSession', () => {
      clearSessionData()
      client.broadcast.to(roomName).emit('sessionStopped', false)
      sendHistoryToAll(io)
      workingBots.forEach(bot => {
        bot.emit('stopSession');
      });
    })

    client.on('bot:browser:close', (sessionTimeEnded) => {
      const remoteAdress = client.request.connection.remoteAddress;
      io.to(roomName).emit('info:bot', `Session on ${remoteAdress} ended!`);
      if (sessionTimeEnded) io.to(roomName).emit('info:sessionTimeEnded');
    });

    client.on('bot:screenshots', (data) => {
      sendBotStatsToRoom(io, 'bot:screenshots', data)
    })

    client.on('disconnect', () => {
      users = users.filter(u => u.id !== client.id);
      if(client.id === session.owner) {
        if (users.length) {
          users[0].emit('startWachingSession', true);
          session.owner = users[0].id
        } else {
          clearSessionData()
          workingBots.forEach(bot => {
            bot.emit('stopSession');
          });
        }
      }
      const remoteAddress = client.request.connection.remoteAddress;
      const isWorkingBot = workingBots.filter(b => b.id === client.id);
      const isReadyBot = readyBots.filter(b => b.id === client.id);
      if (isWorkingBot.length){
        workingBots = workingBots.filter(b => b.id !== client.id);
        io.to(roomName).emit('info:bot', `Working server ${remoteAddress} disconnected!`);
      } else if (isReadyBot.length) {
        readyBots = readyBots.filter(b => b.id !== client.id);
        io.to(roomName).emit('info:bot', `Ready server ${remoteAddress} disconnected!`);
      }
    })

    client.on('botReady', async data => {
      const remoteAdress = client.request.connection.remoteAddress;
      io.to(roomName).emit('info:bot', `Server ${remoteAdress} is ready!`)
      console.log('botReady', session);
      readyBots.push(client);
      startBotsSession();
    });
})