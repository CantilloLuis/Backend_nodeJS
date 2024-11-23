const Music = require("../models/music");

//Metodo para llamar las musicas en general
exports.getMusic = (req, res) => {
    Music.find().then((musicResult) => {
        res.status(200).json(musicResult);
    });
};

// Metodo para obtener una musica por su ID
exports.getMusicById = async (req, res) => {
    try {
        const music = await Music.findById(req.params._id);
        if (!music) return res.status(404).json({ message: 'Canción no encontrada' });
        res.json(music);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la canción', error });
    }
};

const upload = require('../upload');

// Metodo para subir músicas a la bd
exports.uploadMusic = [
    upload.single('audio'),  // Primer middleware
    (req, res) => {         // Segundo middleware (tu controlador)
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún archivo' });
        }

        try {
            // Crear un nuevo documento de música con los datos proporcionados
            const newMusic = new Music({
                titulo: req.body.titulo,
                nombreArtista: req.body.nombreArtista,
                genero: req.body.genero,
                duracion: req.body.duracion,
                urlImagen: req.body.urlImagen,
                contentType: req.file.mimetype,
                fileId: req.file.id,  // o req.file._id dependiendo de tu configuración
            });

            // Guardar en la base de datos
            newMusic.save()
                .then((savedMusic) => {
                    res.status(201).json({
                        message: 'Música subida correctamente',
                        music: savedMusic,
                    });
                })
                .catch((error) => {
                    res.status(500).json({
                        message: 'Error al guardar música',
                        error: error.message
                    });
                });
        } catch (error) {
            res.status(500).json({
                message: 'Error en el proceso de subida',
                error: error.message
            });
        }
    }
];



const mongoose = require('mongoose');
const { ObjectID, GridFSBucket } = require("mongodb");

//Metodo para llamar a los audios especificos de la musica por su id
exports.getAudio = async (req, res) => {
    try {
        // Verificar que la conexión esté establecida
        if (!mongoose.connection.db) {
            throw new Error('No hay conexión a la base de datos');
        }

        // Crear el bucket
        const bucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: 'Music'
        });

        // Convertir el ID a ObjectId
        const fileId = new ObjectID(req.params.fileId);


        // Buscar el archivo primero
        const files = await mongoose.connection.db.collection('Music.files').findOne({ _id: fileId });

        if (!files) {
            return res.status(404).send('Archivo no encontrado');
        }

        // Configurar headers
        res.set('Content-Type', 'audio/mpeg');
        res.set('Accept-Ranges', 'bytes');

        // Crear y enviar el stream
        const downloadStream = bucket.openDownloadStream(fileId);

        downloadStream.on('error', (error) => {
            console.error('Error en downloadStream:', error);
            res.status(500).json({
                message: "Error al transmitir el archivo",
                error: error.message
            });
        });


        downloadStream.pipe(res);

    } catch (error) {
        console.error('Error en getAudio:', error);
        res.status(500).json({
            message: "Error al obtener el archivo",
            error: error.message
        });
    }
};


//Metodo para manejar los like y dislike de los comentarios o reseñas
exports.toggleReaction = async (req, res) => {
    const { _id, commentId } = req.params; // ID de la canción y del comentario
    const { userId, action, username } = req.body;   // ID del usuario y acción ("like" o "dislike")

    try {
        const song = await Music.findById(_id);
        if (!song) {
            return res.status(404).json({ message: 'Canción no encontrada' });
        }

        // Buscar el comentario específico dentro de la canción
        const comment = song.comentarios.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        // Buscar si el usuario ya ha reaccionado a este comentario en particular
        const existingReaction = comment.likeOtherUser.find(reaction => reaction.userId === userId);

        if (action === 'like') {
            if (existingReaction) {
                // Si el usuario ya dio "like", se elimina su "like"
                if (existingReaction.likes === 1) {
                    existingReaction.likes = 0;
                    comment.likes -= 1; // Decrementa el contador de likes del comentario
                } else {
                    // Cambia de "dislike" a "like"
                    existingReaction.likes = 1;
                    existingReaction.dislikes = 0;
                    comment.likes += 1;
                    if (comment.dislikes > 0) comment.dislikes -= 1;
                }
            } else {
                // Si el usuario no ha reaccionado, agregar una nueva reacción de "like"
                comment.likeOtherUser.push({ userId, username, likes: 1, dislikes: 0 });
                comment.likes += 1;
            }
        } else if (action === 'dislike') {
            if (existingReaction) {
                // Si el usuario ya dio "dislike", se elimina su "dislike"
                if (existingReaction.dislikes === 1) {
                    existingReaction.dislikes = 0;
                    comment.dislikes -= 1; // Decrementa el contador de dislikes del comentario
                } else {
                    // Cambia de "like" a "dislike"
                    existingReaction.dislikes = 1;
                    existingReaction.likes = 0;
                    comment.dislikes += 1;
                    if (comment.likes > 0) comment.likes -= 1;
                }
            } else {
                // Si el usuario no ha reaccionado, agregar una nueva reacción de "dislike"
                comment.likeOtherUser.push({ userId, username, likes: 0, dislikes: 1 });
                comment.dislikes += 1;
            }
        } else {
            return res.status(400).json({ message: 'Acción no válida' });
        }

        // Guardar los cambios en la canción
        await song.save();

        res.status(200).json({
            message: action === 'like' ? 'Like actualizado' : 'Dislike actualizado',
            likes: comment.likes,
            dislikes: comment.dislikes
        });
    } catch (error) {
        console.error('Error al alternar reacción:', error);
        res.status(500).json({ message: 'Error al alternar reacción' });
    }
};





// Metodo para agregar un comentario a una musica
exports.addComment = async (req, res) => {
    try {
        const music = await Music.findById(req.params._id);
        if (!music) return res.status(404).json({ message: 'Canción no encontrada' });

        // Crear y añadir el nuevo comentario
        const newComment = { text: req.body.text, userId: req.body.userId, calificacion: req.body.calificacion, username: req.body.username, createdAt: new Date(), updatedAt: new Date() };
        music.comentarios.push(newComment);
        await music.save();

        res.status(201).json({ message: 'Comentario agregado', comment: newComment });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar el comentario', error });
    }
};

// Metodo para actualizar un comentario específico de una musica
exports.updateComment = async (req, res) => {
    try {
        const music = await Music.findById(req.params._id);
        if (!music) return res.status(404).json({ message: 'Canción no encontrada' });

        // Encontrar el comentario y actualizar el texto y la fecha de actualización
        const comment = music.comentarios.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });

        comment.text = req.body.text;
        comment.updatedAt = new Date();
        await music.save();

        res.json({ message: 'Comentario actualizado', comment });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el comentario', error });
    }
};

//Metodo para eliminar un comentario específico de una musica
exports.deleteComment = async (req, res) => {
    try {
        const music = await Music.findById(req.params._id);
        if (!music) return res.status(404).json({ message: 'Canción no encontrada' });

        // Eliminar el comentario por ID
        const comment = music.comentarios.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });

        comment.remove();
        await music.save();

        res.json({ message: 'Comentario eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el comentario', error });
    }
};


//Metodo para incrementar las vistas de una musica
exports.incrementViews = async (req, res) => {
    const { _id } = req.params;

    try {
        // Encuentra la canción por ID y aumenta el contador de vistas en 1
        const updatedSong = await Music.findByIdAndUpdate(
            _id,
            { $inc: { visitas: 1 } }, // Incrementa el campo `visitas` en 1
            { new: true } // Retorna el documento actualizado
        );

        if (!updatedSong) {
            return res.status(404).json({ message: "Canción no encontrada" });
        }

        res.json({ message: "Vistas incrementadas", updatedSong });
    } catch (error) {
        console.error("Error al incrementar las vistas:", error);
        res.status(500).json({ message: "Error al incrementar las vistas" });
    }
};
