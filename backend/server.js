require('dotenv').config();
const express = require('express');
const cors = require('cors');

const analyzeRouter = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', analyzeRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
