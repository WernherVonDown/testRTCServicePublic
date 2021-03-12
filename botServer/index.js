require('dotenv/config')
const puppeteer = require('puppeteer');
const socket = require('socket.io-client')(`http://${process.env.SOCKET_SERVER_IP}`);
const Bot = require('./Bot');

let bot;

async function getBot() {
    return new Bot();
}

socket.on('connect', () => {
    socket.emit('botReady')
})

socket.on('startSession', ({settings, tasks}) => {
    console.log(tasks, settings)
    start(settings, tasks);

})

socket.on('stopSession', () =>stop())

async function stop() {
    console.log('stop')
    await bot.planEnd(0);
}

async function start(settings, tasks) {
    bot = await getBot();
    await bot.getPages(tasks);
    await bot.start(settings, socket);
}