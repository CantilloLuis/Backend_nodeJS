const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Método para registrar un nuevo usuario
exports.signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) return res.status(400).json({ message: 'Usuario o correo ya registrados' });

        // Crear nuevo usuario
        const newUser = new User({ username, email, password });
        await newUser.save();

        // Generar token de autenticación
        const token = jwt.sign({ userId: newUser._id }, 'your_jwt_secret');

        res.status(201).json({ token, user: { username: newUser.username, email: newUser.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Método para iniciar sesión
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Buscar el usuario por nombre de usuario
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });

        // Comparar las contraseñas
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });

        // Generar token de autenticación
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');

        res.status(200).json({ token, user: { username: user.username, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
