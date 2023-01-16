import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import {
    ENV as ChainID,
} from "@solana/spl-token-registry";
// import redis from 'redis';
import { Pool } from 'pg';

import { DB_URL } from "./config";

// Solana Cluster
export const cluster = "devnet";

export enum ENV {
    Mainnet = "mainnet-beta",
    Testnet = "testnet",
    Devnet = "devnet",
    Localnet = "localnet"
}
export const ENDPOINTS = [
    {
        name: ENV.Mainnet,
        endpoint: "https://solana-api.projectserum.com/",
        chainID: ChainID.MainnetBeta,
    },
    {
        name: ENV.Testnet,
        endpoint: clusterApiUrl(ENV.Testnet),
        chainID: ChainID.Testnet,
    },
    {
        name: ENV.Devnet,
        endpoint: clusterApiUrl(ENV.Devnet),
        chainID: ChainID.Devnet,
    },
    {
        name: ENV.Localnet,
        endpoint: "http://127.0.0.1:8899",
        chainID: ChainID.Devnet,
    },
];

// Connection
export const connection = new Connection(ENDPOINTS[2].endpoint, 'processed');

// export const publisher = redis.createClient(REDIS_CONFIG);
// export const subscriber = redis.createClient(REDIS_CONFIG);
// export const redisClient = redis.createClient(REDIS_CONFIG);

export const ADMIN_KEY = new PublicKey("5eD3VhNo3iQ9UZ65BbWEMQstgUzHBM8bjg21TsnYeZxJ");

// PostgreSQL exports
// export const connect = async () => {
//     const mysqlconnection = await mysql2.createConnection({
//         host: process.env.DB_HOST,
//         user: process.env.DB_USER,
//         password: process.env.DB_PWD,
//         database: process.env.DB_NAME
//     });
//     return mysqlconnection
// };
// export const end = async (mysqlconnection: any) => {
//     mysqlconnection.end()
// }

// ==> Database Connection:
const pool = new Pool({
    connectionString: DB_URL,
});

pool.on('connect', () => {
    console.log('Database successfully connected!');
});

export const db = {
    query: (text, params?) => pool.query(text, params),
};

export default db;

