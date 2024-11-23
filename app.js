var express = require("express");
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require("cors");
var app = express();
const morgan = require("morgan");
app.use(morgan("tiny"))

// Asegúrate de incluir el dominio de producción en la configuración de CORS
const allowedOrigins = [
    'https://projecto-de-musica-react-node-js.vercel.app', // Dominio del frontend en producción
    'http://localhost:3000', // Opcional, para pruebas locales

];

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://projecto-de-musica-react-node-js.vercel.app', // Dominio de producción
            'http://localhost:3000' // Dominio local
        ];

        // Verifica si el origen está en la lista de permitidos
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
    credentials: true // Permitir cookies o credenciales si las usas
}));

// Manejar solicitudes preflight
app.options('*', cors());

const musicRoutes = require("./routes/music");
const userRoutes = require("./routes/user");



app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// codigo donde realizamos la conexion con mongo atlas
mongoose
    .connect(process.env.URL_MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Estamos conectados");

    });

//Ruta de la api de musica
app.use('/api/music', musicRoutes);

//Ruta de la api de login
app.use('/api/user', userRoutes);


module.exports = app;
