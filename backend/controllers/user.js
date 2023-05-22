/**
* Importation du model User, de bcrypt et de jsonwebtoken
*/
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
* Crée un nouvel utilisateur à partir d'un mot de passe et d'un email
* @param { Object } req - Objet contenant la requête faite au serveur, dont les informations d'inscription
* @param { Object } res - Objet contenant la réponse serveur
* @param { Object } next - permet de passer au middleware suivant
* @return { Object } res - Renvoie une erreur 500 si bcrypt ne fonctionne pas, 
* une erreur 400 si la sauvegarde de l'utilisateur dans la base de données a échouée, 
* et un status 201 si l'utilisateur a bien été crée
*/
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

/**
* Permet de se connecter via une paire mot de passe email enregistrée dans la base de données
* @param { Object } req - Objet contenant la requête faite au serveur, dont les informations de connexion
* @param { Object } res - Objet contenant la réponse serveur
* @param { Object } next - permet de passer au middleware suivant
* @return { Object } res - Renvoie une erreur 500 si la requête est en erreur, 
* une erreur 401 si la paire login/ mot de passe est incorrecte, 
* et un status 200 ainsi que le user_id et le token si la connexion a été faite
*/
exports.login = (req, res, next) => {
User.findOne({ email: req.body.email })
    .then(user => {
        if (!user) {
            return res.status(401).json({ error: 'Paire login/ mot de passe incorrecte' });
        }
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    return res.status(401).json({ error: 'Paire login/ mot de passe incorrecte' });
                }
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        { userId: user._id },
                        process.env.TOKEN_ENCRYPTION,
                        { expiresIn: '24h' }
                    )
                });
            })
            .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};