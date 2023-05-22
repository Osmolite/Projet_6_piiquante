/**
 * Importation d'express, express-rate-limit, mongoose, dotenv,
 * des fichiers routes sauce et user, ainsi que de path
 */
const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');

/**
 * Utilisation d'express-rate-limit permettant de limiter le nombre de requêtes par fenêtre par 15 minutes
 */
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	max: 1000, 
	standardHeaders: true, 
	legacyHeaders: false, 
})
app.use(limiter);

/**
 * Connection à MongoDB via mongoose en utilisant le fichier .env
 */
mongoose.connect(process.env.MONGO_CONNECTION,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

/**
 * Ouverture des autorisations pour le système de sécurité CORS
 */
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

/**
 * Appel et utilisation des fichiers routes,
 * L'image est renvoyée en tant que fichier static
 */
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

/**
 * Exportation du module app
 */
module.exports = app;