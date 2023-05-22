/**
* Importation de mongoose et de mongoose-unique-validator
*/
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

/**
* Création du schema utilisateur pour mongoDB,
* l'email ne peut être utilisé et enregistré qu'une seule fois
*/
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

/**
* Exportation du model
*/
module.exports = mongoose.model('User', userSchema);