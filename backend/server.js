import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handlers as recordsHandlers } from './routes/records.js';
import { handlers as recordHandler } from './routes/record.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/records', (req, res) => {
  const handler = recordsHandlers[req.method.toLowerCase()];
  if (handler) {
    handler(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
});

// Handle /api/record/:id for GET, PUT, DELETE (this must come first to catch specific IDs)
app.use('/api/record/:id', (req, res) => {
  const handler = recordHandler[req.method.toLowerCase()];
  if (handler) {
    handler(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
});

// Handle /api/record for POST (create new record without ID)
app.use('/api/record', (req, res) => {
  const handler = recordHandler[req.method.toLowerCase()];
  if (handler) {
    handler(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Business Monitoring ERP API is running!' });
});

// Only start the server in development mode
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
