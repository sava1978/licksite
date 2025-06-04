const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

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

// Бэкап в Google Drive (через переменную окружения)
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

function uploadBackup() {
  const backupContent = JSON.stringify({ content, timestamp: new Date() }, null, 2);
  const fileMetadata = {
    name: `backup-${new Date().toISOString()}.json`,
    parents: ['YOUR_FOLDER_ID'], // <-- сюда впиши ID своей папки
  };

  const media = {
    mimeType: 'application/json',
    body: Buffer.from(backupContent),
  };

  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  }, (err, file) => {
    if (err) {
      console.error('Ошибка загрузки:', err);
    } else {
      console.log('Бэкап залит на Google Drive, ID:', file.data.id);
    }
  });
}

// Бэкап каждые 30 минут
setInterval(uploadBackup, 1000 * 60 * 30);
