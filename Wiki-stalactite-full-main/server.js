// Importation
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// Initialisation de l'application et du serveur HTTP
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Autoriser toutes les origines
    methods: ['GET', 'POST']
  }
});

// Middleware pour autoriser les requêtes CORS
app.use(cors());

// Configuration pour servir les fichiers statiques depuis le dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// Variables pour stocker l'historique des messages
let chatHistory = [];

// Route par défaut pour vérifier si le serveur fonctionne
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connexion des sockets
io.on('connection', (socket) => {
  console.log(`Utilisateur connecté : ${socket.id}`);

  // Envoyer l'historique des messages au nouvel utilisateur
  socket.emit('chat-history', chatHistory);

  // Réception d'un message de chat
  socket.on('chat-message', (data) => {
    // Enregistrer le message dans l'historique
    chatHistory.push(data);

    // Limiter l'historique à 50 messages pour ne pas surcharger
    if (chatHistory.length > 50) chatHistory.shift();

    // Diffuser le message à tous les utilisateurs
    io.emit('chat-message', data);
  });

  // Déconnexion de l'utilisateur
  socket.on('disconnect', () => {
    console.log(`Utilisateur déconnecté : ${socket.id}`);
  });
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
