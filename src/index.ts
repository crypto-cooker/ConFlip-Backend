import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

import { initRoute } from './routes';
import { subscribePlay } from './scripts';
import { initSocket } from './socket';

dotenv.config();

const app = express();

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

initSocket(io);
initRoute(app);

server.listen(8080, async () => {
  console.log('--@ Start: Listening on http://localhost:8080');
  subscribePlay(io);
});