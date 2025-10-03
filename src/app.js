const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const moviesRoutes = require('./routes/movies');
const analyticsRoutes = require('./routes/analytics');
const db = require('./config/database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));


app.use('/api/movies', moviesRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


app.get('/analytics', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'analytics.html'));
});


app.listen(PORT, () => {
  console.log(`MovieFlix rodando!`);
  console.log(`Acesse: http://localhost`);
});

module.exports = app;
