const express = require('express');
const cors = require('cors');
const recordsRouter = require('./routes/records');
const recordRouter = require('./routes/record');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/records', recordsRouter);
app.use('/api/record', recordRouter);

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

// Export the Express app
if (typeof exports !== 'undefined') {
  module.exports = app;
}

export default app;
