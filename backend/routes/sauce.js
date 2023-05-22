/**
 * Importation d'express, de router, du fichier controller sauce et des middlewares auth et multer, 
 */
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const sauceCtrl = require('../controllers/sauce');

/**
 * Création des routes avec les mots-clefs get, post, put, delete
 * vers les méthodes du fichier controller sauce
 */
router.get('/', auth, sauceCtrl.getAllSauces);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.manageLikes);

/**
 * Exportation du module router
 */
module.exports = router;