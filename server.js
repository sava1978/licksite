const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => res.redirect('/preview.html'));

const server = app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

let content = '<h1>Добро пожаловать!</h1>';

wss.on('connection', (ws) => {
  ws.send(content);

  ws.on('message', (message) => {
    content = message.toString();
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client !== ws) {
        client.send(content);
      }
    });
  });
});

