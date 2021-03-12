import connectToRedis from './redisConnector';
import redisHelper from '../../redisHelper';

export = async (): Promise<void> => {
    try {
        const redisClient: any = connectToRedis();
        redisHelper.init(redisClient);
    } catch (e) {
        console.error(e);
    }
};
