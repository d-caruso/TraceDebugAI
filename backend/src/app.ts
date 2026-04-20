import express from 'express';
import cors from 'cors';
import analyzeRouter from './routes/analyze';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', analyzeRouter);

export default app;
