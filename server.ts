import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createAiRouter } from './api/aiRouter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 32600;
  // Loopback by default: the server-side GEMINI_API_KEY must not be exposed to the network.
  // Set HOST=0.0.0.0 only behind your own auth/reverse proxy.
  const host = process.env.HOST || '127.0.0.1';
  const isProduction = process.env.NODE_ENV === 'production';

  app.disable('x-powered-by');
  app.use('/api', createAiRouter({ serverGeminiKey: process.env.GEMINI_API_KEY || undefined }));

  const httpServer = http.createServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(port, host, () => {
    console.log(`KitYar server running on http://${host}:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
