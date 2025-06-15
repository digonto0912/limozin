const express = require('express');
const cors = require('cors');
const recordsRouter = require('./routes/records');
const recordRouter = require('./routes/record');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://limozin.vercel.app', /\.vercel\.app$/]
    : 'http://localhost:3001'
}));
app.use(express.json());

// Routes
app.use('/api/records', recordsRouter);
app.use('/api/record', recordRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Business Monitoring ERP API is running!' });
});

// Only start the server if we're not in a Vercel environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app;
