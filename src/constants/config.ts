export const DB_URL = process.env.REDIS_PORT ?? "postgres://admin:pass@localhost:5433/coinflip";
export const REDIS_CONFIG = {
    port: 6379,//process.env.REDIS_PORT,
    host: 'localhost',//process.env.REDIS_HOST,
    auth_pass: '',//process.env.REDIS_PASS
}
