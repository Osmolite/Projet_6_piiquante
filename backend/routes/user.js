/**
 * Importation d'express et du fichier controller user,
 * création de l'objet router
 */
const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

/**
 * Création des routes avec le mots-clef post,
 * vers les méthodes du fichier controller user
 */
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

/**
 * Exportation du module router
 */
module.exports = router;