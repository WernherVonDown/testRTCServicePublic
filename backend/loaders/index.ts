import socketLoader from './socketLoader';
import redisLoader from './redis';
import sessionStorage from '../sessionsStorage'

async function init({ httpServer }): Promise<void> {
    await redisLoader();
    await socketLoader(httpServer);
    await sessionStorage.init();
}

export {
    init,
};
