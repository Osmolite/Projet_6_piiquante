/**
* Importation de multer
*/
const multer = require('multer');

/**
* Types mime traités et acceptés ainsi que leur extension associée
*/
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

/**
* Définition de la destination et du nom de l'image sauvegardée
*/
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

/**
* Création de l'objet multer
*/
module.exports = multer({storage: storage}).single('image');