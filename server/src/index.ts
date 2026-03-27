import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

// Load from project root and server dir
dotenv.config({ path: '../../.env' });
dotenv.config({ path: '../.env' });
dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const allowedOrigins = [
  process.env.CLIENT_URL ?? 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Routes
import { scoutingRouter } from './routes/scouting';
import { draftsRouter } from './routes/drafts';
import { gamesRouter } from './routes/games';
import { adviceRouter } from './routes/advice';
import { prospectsRouter } from './routes/prospects';

app.use('/api/scouting', scoutingRouter);
app.use('/api/drafts', draftsRouter);
app.use('/api/games', gamesRouter);
app.use('/api/draft/advice', adviceRouter);
app.use('/api/prospects', prospectsRouter);

// Socket.io (for live scores & multiplayer drafts later)
io.on('connection', (socket) => {
  console.log(`[ws] connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[ws] disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT ?? 4000;
httpServer.listen(PORT, () => {
  console.log(`[server] GridironIQ API running on http://localhost:${PORT}`);
});
