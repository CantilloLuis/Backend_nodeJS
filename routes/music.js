const express = require("express");
const router = express.Router();

const musicController = require("../controllers/musicController");

//Rutas declaradas para la manipulacion de las musicas
router.get("/consultarMusic", musicController.getMusic);
router.post("/enviarMusic", musicController.uploadMusic);
router.get('/musicById/:_id', musicController.getMusicById);
router.get('/audio/:fileId', musicController.getAudio);

//Rutas para manejar los like y dislike de los comentarios o reseñas
router.post("/:_id/comentario_reaccion/:commentId", musicController.toggleReaction);

// Ruta para incrementar las vistas de una canción en especifico
router.put('/:_id/incrementar_vistas', musicController.incrementViews);


// Rutas para manejar comentarios
router.post('/comentarios/:_id/', musicController.addComment); // Agregar un comentario a una canción
router.put('/:_id/comentario_update/:commentId', musicController.updateComment); // Actualizar un comentario específico
router.delete('/:_id/comentario_delete/:commentId', musicController.deleteComment); // Eliminar un comentario específico


module.exports = router;