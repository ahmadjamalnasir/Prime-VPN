import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { vpnRouter } from './routes/vpn';
import { authRouter } from './routes/auth';
import { premiumRouter } from './routes/premium';
import { setupDatabase } from './config/database';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(cors());
app.use(express.json());
app.use('/api/vpn', vpnRouter);
app.use('/api/auth', authRouter);
app.use('/api/premium', premiumRouter);

setupDatabase();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
