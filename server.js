const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let htmlContent = '<h1>Начальный контент</h1>';

app.use(express.static('public')); // папка с frontend

io.on('connection', (socket) => {
  // Отправляем сразу текущий html новому клиенту
  socket.emit('update', htmlContent);

  // Получаем изменения от редактора
  socket.on('contentChange', (newContent) => {
    htmlContent = newContent;
    // Рассылаем всем, кроме отправителя
    socket.broadcast.emit('update', htmlContent);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
