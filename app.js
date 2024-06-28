const express = require('express');
const corsMiddleware = require('./middlewares/cors');
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadsRoutes');
const crudRoutes = require('./routes/crudRoutes');
const { connectToDb } = require('./models/db');

const app = express();

// Enable CORS for all requests
app.use(corsMiddleware);

app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', leadRoutes);
app.use('/api', crudRoutes);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

module.exports = app;
