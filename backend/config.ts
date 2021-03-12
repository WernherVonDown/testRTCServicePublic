require('dotenv/config');

const {
    AWS_ID,
    AWS_SECRET,
    REGION,
    BOT_INSTANSE_AMI,
    SECRET_KEY_NAME,
    ROOM_API_IP,
    SITE_ENV_URL,
    SITE_LOGO_URL,
    REDIS_HOST,
    REDIS_PORT,
    BOT_SERVER_AMI
} = process.env;

export = {
    aws_id: AWS_ID,
    aws_secret: AWS_SECRET,
    region: REGION,
    bot_instance_ami: BOT_INSTANSE_AMI,
    bot_server_key: SECRET_KEY_NAME,
    bot_server_iam: BOT_SERVER_AMI,
    security_group_ids: ['sg-a400e193'],
    room_api_ip: ROOM_API_IP,
    site_env_url: SITE_ENV_URL,
    site_logo_url: SITE_LOGO_URL,
    redis: {
        host: REDIS_HOST || '127.0.0.1',
        port: REDIS_PORT || '6379',
        no_ready_check: true,
    }
}