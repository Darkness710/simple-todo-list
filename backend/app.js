
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const indexRouter = require('./routes/index');
const { getDB } = require('./config/database');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

app.use(cors({ origin: 'https://apitodo.shiddiqsm.my.id' }));

app.use(express.json());
app.use('/api/todos', todoRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend berjalan',
  });
});

app.get('/api/db-health', async (req, res) => {
  try {
    await getDB().command({ ping: 1 });

    res.json({
      status: 'ok',
      message: 'MongoDB Atlas terhubung',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Koneksi database gagal',
    });
  }
});

app.use('/', indexRouter);

module.exports = app;
