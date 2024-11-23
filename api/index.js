const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Configuración de CORS
const allowedOrigins = [
    'https://projecto-de-musica-react-node-js.vercel.app',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Importar rutas
const musicRoutes = require('../routes/music');
const userRoutes = require('../routes/user');

// Ruta de prueba básica
app.get('/', (req, res) => {
    res.json({ message: 'API is working!' });
});

app.get('/api', (req, res) => {
    res.json({ message: 'API endpoint is working!' });
});

// Conectar a MongoDB
mongoose.connect(process.env.URL_MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Rutas
app.use('/api/music', musicRoutes);
app.use('/api/user', userRoutes);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        requested_url: req.originalUrl
    });
});

module.exports = app;