/**
* Importation de http et du fichier app
*/
const http = require('http');
const app = require('./app');

/**
* Transforme Port en entier positif si possible
* @param { String } val - Port venant de l'environnement sinon '3000'
* @return { String | Number | Boolean } port - Renvoie port normalisé 
*/
const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

/**
* Normalise le port et l'attribut à express
*/
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
* Gère les erreurs du serveur
* @param { error } error - Status erreur provenant du serveur http
*/
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/** 
* Création du serveur
*/
const server = http.createServer(app);

/** 
* Association du gestionnaire d'erreur au serveur et construction de l'adresse
*/
server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

/** 
* Lancement du serveur
*/
server.listen(port);