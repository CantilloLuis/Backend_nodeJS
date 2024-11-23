const mongoose = require("mongoose");

const likeOtherUser = new mongoose.Schema({
    userId: { type: String, required: true }, // ID del usuario que comenta
    username: { type: String, require: true }, // Username de la persona que realiza el like o dislike
    likes: { type: Number, default: 0 },             // Contador de likes
    dislikes: { type: Number, default: 0 },          // Contador de dislikes

});

const comentario = new mongoose.Schema({
    userId: { type: String, required: true }, // ID del usuario que comenta
    username: { type: String, require: true }, // Username de la persona que realiza el comentario
    text: { type: String, required: true },          // Texto del comentario
    likes: { type: Number, default: 0 },             // Contador de likes
    dislikes: { type: Number, default: 0 },          // Contador de dislikes
    likeOtherUser: { type: [likeOtherUser], default: [] },  // Array de like o dislike otros usuarios
    calificacion: { type: Number, default: 0 }, // Calificaciones
    createdAt: { type: Date, default: Date.now },    // Fecha de creación
    updatedAt: { type: Date, default: Date.now }     // Fecha de última actualización
});

const musicSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    nombreArtista: { type: String, required: true },
    genero: { type: String, required: false },
    duracion: { type: String, required: true },
    urlImagen: { type: String, required: true },
    contentType: { type: String, required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'MusicFile' }, // ID del archivo en GridFS
    comentarios: { type: [comentario], default: [] },  // Array de comentarios
    visitas: { type: Number, default: 0 } // Contador de visitas
}, { timestamps: true });

module.exports = mongoose.model("Music", musicSchema);
