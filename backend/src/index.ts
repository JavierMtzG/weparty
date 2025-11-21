import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import health from './routes/health.js';
import rooms from './routes/rooms.js';
import topics from './routes/topics.js';
import { env } from './config/env.js';
import { registerSockets } from './socket/index.js';

const app = express();
app.use(cors({ origin: [env.frontendOrigin, 'http://localhost:5173'] }));
app.use(express.json());
app.use(health);
app.use(rooms);
app.use(topics);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: [env.frontendOrigin, 'http://localhost:5173'] },
});

registerSockets(io);

server.listen(env.port, () => {
  console.log(`API listening on port ${env.port}`);
});
