import express from 'express';
import cors from 'cors';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
