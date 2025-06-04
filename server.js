const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let currentCode = '<h1>Добро пожаловать!</h1>';

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'preview.html'));
});

wss.on('connection', (ws) => {
  ws.send(currentCode);

  ws.on('message', (message) => {
    currentCode = message.toString();
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(currentCode);
      }
    });
  });
});

server.listen(10000, () => {
  console.log('Сервер запущен на порту 10000');
});
