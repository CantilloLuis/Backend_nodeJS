const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

// Crear el almacenamiento con GridFsStorage
const storage = new GridFsStorage({
    url: process.env.URL_MONGODB,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = `${Date.now()}-${file.originalname}`;
            const fileInfo = {
                filename: filename,
                bucketName: 'Music',
                metadata: {
                    originalname: file.originalname,
                    mimetype: file.mimetype
                }
            };
            resolve(fileInfo);
        });
    }
});

// Manejar errores de conexión
storage.on('connectionError', function (err) {
    console.log('Error en la conexión a MongoDB:', err);
});

// Crear el middleware de multer con manejo de errores
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Verificar que el archivo sea de tipo audio
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('El archivo debe ser un audio válido'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // Limitar a 10MB por ejemplo
    }
});

// Exportar la configuración de Multer
module.exports = upload;