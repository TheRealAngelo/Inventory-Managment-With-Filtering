require('dotenv').config();
const express = require('express');
const productRoutes = require('./routes/productRoutes');
const tagRoutes = require('./routes/tagRoutes');
const app = express();

app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/tags', tagRoutes);

// minimal error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
