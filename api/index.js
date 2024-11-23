// api/index.js
const mongoose = require('mongoose');
const express = require('express');
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

// Conectar a MongoDB
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    const db = await mongoose.connect(process.env.URL_MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    cachedDb = db;
    return db;
}

// Middleware para asegurar la conexión a la DB
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        next(error);
    }
});

// Rutas
app.use('/api/music', musicRoutes);
app.use('/api/user', userRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Exportar para Vercel
module.exports = app;