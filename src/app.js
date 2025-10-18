require('dotenv').config();
const express = require('express');
const productRoutes = require('./routes/productRoutes');
const tagRoutes = require('./routes/tagRoutes');
const app = express();

app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/tags', tagRoutes);

// centralized error handler returns JSON with code and message
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, error: message, code: status });
});

module.exports = app;
