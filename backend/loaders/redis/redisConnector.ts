import redis from 'async-redis';
import config from '../../config'

let db: any = null;

export = (): void => {
    if (!db) {
        db = redis.createClient(config.redis);
        db.on('error', (err) => {
            console.log('Redis connection failed', err);
        });
        db.on('connect', () => {
            console.log('Redis connection established');
        });
    }

    return db;
};
