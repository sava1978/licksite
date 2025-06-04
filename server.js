const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

let content = '<h1>Добро пожаловать!</h1>';

app.use(express.static(path.join(__dirname, 'public')));

// Отдаём editor.html
app.get('/editor.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'editor.html'));
});

// Отдаём preview.html
app.get('/preview.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'preview.html'));
});

// Корень теперь отдаёт preview.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'preview.html'));
});

// Socket.io логика
io.on('connection', (socket) => {
  console.log('Пользователь подключился');

  // Отправить текущий контент новому подключившемуся
  socket.emit('update', content);

  // При изменении контента — рассылаем всем
  socket.on('contentChange', (data) => {
    content = data;
    socket.broadcast.emit('update', content);
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился');
  });
});

// Порт от Render или локальный
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
