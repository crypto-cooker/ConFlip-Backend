import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';

// import { subscriber } from './constants/utils';
import { initRoute } from './routes';
import { subscribePlay } from './scripts';
// import { loadRawDump } from './dump';

const app = express();

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = http.createServer(app);
// app.get('/dump', (req, res) => {
//   res.send(loadRawDump('/dumps/output.json'));
// });

initRoute(app);

server.listen(8080, async () => {
  // subscriber.subscribe("new-game");
  console.log('--@ Start: Listening on http://localhost:8080');
  subscribePlay();
});