/**
* Importation du model Sauce et de fs
*/
const Sauce = require('../models/Sauce');
const fs = require('fs');

/**
* Recupère toutes les sauces de la base de données et les renvoie
* @param { Object } req - Objet contenant la requête faite au serveur
* @param { Object } res - Objet contenant la réponse serveur
* @param { Object } next - permet de passer au middleware suivant
* @return { Object } res - Renvoie un status 200 ainsi que toutes les sauces et un status 400 si il y a une erreur
*/
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
  .then(
    (sauces) => {
      res.status(200).json(sauces);
    }
    )
    .catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
      );
    };

/**
* Permet de créer et de sauver une nouvelle sauce dans la base de données à partir du formulaire rempli du site
* @param { Object } req - Objet contenant la requête faite au serveur, notamment les données du formulaire
* @param { Object } res - Objet contenant la réponse serveur
* @param { Object } next - permet de passer au middleware suivant
* @return { Object } res - Renvoie un status 201 si la sauce a bien été enregistrée et un status 400 si il y a une erreur
*/
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  console.log(sauceObject);
  delete sauceObject.userId;
  const sauce = new Sauce({
    name: sauceObject.name,
    manufacturer: sauceObject.manufacturer,
    description: sauceObject.description,
    mainPepper: sauceObject.mainPepper,
    heat: sauceObject.heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    userDisliked: [],
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  
  sauce.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};
 
/**
* Permet d'afficher une seule sauce en récupérant l'id de celle ci dans les paramètres de la requête
* @param { Object } req - Objet contenant la requête faite au serveur
* @param { Object } res - Objet contenant la réponse serveur
* @param { Object } next - permet de passer au middleware suivant
* @return { Object } res - Renvoie un status 200 ainsi que la sauce voulue et un status 404 si il y a une erreur
*/
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
      );
    };

/**
* Permet de modifier les informations d'une sauce dans la base de données
* @param { Object } req - Objet contenant la requête faite au serveur
* @param { Object } res - Objet contenant la réponse serveur
* @param { Object } next - permet de passer au middleware suivant
* @return { Object } res - Renvoie une erreur 400 si la sauce n'a pas été trouvé, 
* une erreur 403 si l'utilisateur n'est pas autorisé à modifier cet objet, 
* une erreur 400 si la sauce n'a pas pu être modifié correctement,
* et un status 200 si les modifications ont été faites correctement
*/
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  
  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
  .then((sauce) => {
    if (sauce.userId != req.auth.userId) {
      res.status(403).json({ message : 'unauthorized request'});
    } else {
      Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
      .then(() => res.status(200).json({message : 'Sauce modifiée!'}))
      .catch(error => res.status(400).json({ error }));
    }
  })
  .catch((error) => {
    res.status(400).json({ error });
  });
};

/**
* Permet de supprimer une sauce de la base de données
* @param { Object } req - Objet contenant la requête faite au serveur
* @param { Object } res - Objet contenant la réponse serveur
* @param { Object } next - permet de passer au middleware suivant
* @return { Object } res - Renvoie une erreur 400 si la sauce n'a pas été trouvé, 
* une erreur 403 si l'utilisateur n'est pas autorisé à modifier cet objet, 
* une erreur 400 si la sauce n'a pas pu être supprimé correctement,
* et un status 200 si la suppression a été faite correctement
*/
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
  .then(sauce => {
    if (sauce.userId != req.auth.userId) {
      res.status(403).json({message: 'Not authorized'});
    } else {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({_id: req.params.id})
        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
        .catch(error => res.status(400).json({ error }));
      });
    }
  })
  .catch( error => {
    res.status(400).json({ error });
  });
};

/**
* Permet de gérer les likes et dislikes des utilisateurs
* @param { Object } req - Objet contenant la requête faite au serveur
* @param { Object } res - Objet contenant la réponse serveur
* @param { Object } next - permet de passer au middleware suivant
* @return { Object } res - Renvoie une erreur 400 si la sauce n'a pas été trouvé ou n'a pas pu être enregistré,
* et renvoie un status 200 si la sauve a bien été liké ou disliké
*/
exports.manageLikes = (req, res, next) => {
  const sauceObject = {...req.body};
  if (sauceObject.userId != req.auth.userId) {
    res.status(403).json({message: 'Not authorized'});
  } else { 
    Sauce.findOne({ _id: req.params.id})
    .then( sauce => {
      var usersLikedTab = sauce.usersLiked;
      var usersDislikedTab = sauce.usersDisliked;
      const userIdInUsersLiked = usersLikedTab.includes(sauceObject.userId);
      const userIdInUsersDisliked = usersDislikedTab.includes(sauceObject.userId);
      const like = sauceObject.like;
      switch (like) {
        case 1:
        if (!userIdInUsersLiked && !userIdInUsersDisliked) {
          sauce.likes = usersLikedTab.push(sauceObject.userId);
          console.log("Like ajouté !")
        } else {
          console.log("Erreur serveur")
        }
        break;
        case 0:
        if (userIdInUsersLiked && !userIdInUsersDisliked) {
          var indiceLike = usersLikedTab.indexOf(sauceObject.userId);
          usersLikedTab.splice(indiceLike,1);
          sauce.likes -= 1;
          console.log("Like supprimé !")
        } else if (!userIdInUsersLiked && userIdInUsersDisliked) {
          var indiceDislike = usersDislikedTab.indexOf(sauceObject.userId);
          usersDislikedTab.splice(indiceDislike,1);
          sauce.dislikes -= 1;
          console.log("Dislike supprimé !")
        } else {
          console.log("Erreur serveur")
        }
        break;
        case -1:
        if (!userIdInUsersLiked && !userIdInUsersDisliked) {
          sauce.dislikes = usersDislikedTab.push(sauceObject.userId);
          console.log("Dislike ajouté !")
        } else {
          console.log("Erreur serveur")
        }
        break;
      }
      Sauce.updateOne(
        { _id: req.params.id}, 
        { likes: sauce.likes, dislikes: sauce.dislikes, usersLiked: usersLikedTab, usersDisliked: usersDislikedTab, _id: req.params.id})
        .then(() => res.status(200).json({message : 'Sauce likée!'}))
        .catch(error => res.status(400).json({ error }));
      })
      .catch( error => {
        res.status(400).json({ error });
      });  
    }
  }
  