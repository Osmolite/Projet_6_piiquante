/**
* Importation de jsonwebtoken
*/
const jwt = require('jsonwebtoken');

/**
* Vérifie que le token de l'utilisateur est valide pour accéder à certaines pages et fonctionnalités
* @param { Object } req - Objet contenant la requête faite au serveur
* @param { Object } res - Objet contenant la réponse serveur
* @param { Object } next - permet de passer au middleware suivant
* @return { Object } res - Renvoie une erreur 401 si le token ne correspond pas
*/
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, process.env.TOKEN_ENCRYPTION);
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};