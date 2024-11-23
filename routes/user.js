const express = require('express');
const authController = require('../controllers/userController'); // Controlador de autenticación

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/signup', authController.signup); // Llama al método signup en el controlador

// Ruta para iniciar sesión
router.post('/login', authController.login); // Llama al método login en el controlador

module.exports = router;
