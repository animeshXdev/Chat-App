const express = require('express');
const http = require('http');
const path = require('path');
const multer = require('multer');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Set up static and view
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

const users = {};

// Routes
app.get('/', (req, res) => {
  res.render('chat');
});

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('No file uploaded');

  const fileUrl = `/uploads/${file.filename}`;
  const isImage = file.mimetype.startsWith('image/');

  io.emit('file-uploaded', {
    name: users[req.body.socketId] || 'Anonymous',
    fileUrl,
    originalName: file.originalname,
    isImage,
    timestamp: new Date().toISOString(),
  });

  res.status(200).send('File uploaded');
});

// Socket handling
io.on('connection', (socket) => {
  socket.on('new-user', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('user-connected', username);
    io.emit('update-user-list', users);
  });

  socket.on('send-message', (msg) => {
    io.emit('chat-message', {
      message: msg,
      name: users[socket.id] || 'Anonymous',
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      socket.broadcast.emit('user-disconnected', users[socket.id]);
      delete users[socket.id];
      io.emit('update-user-list', users);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
