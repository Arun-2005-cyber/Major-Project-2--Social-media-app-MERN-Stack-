const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const path = require('path');
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

dotenv.config();

// ✅ Initialize express app
const app = express();

// ✅ CORS middleware
app.use(cors({
  origin: "http://localhost:3000", // your frontend
  credentials: true
}));

// ✅ Body parser
app.use(express.json());

// ✅ Connect DB
connectDB();

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Attach socket.io
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  },
});

// ✅ Attach io to every request BEFORE routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Routes
app.get("/", (req, res) => {
  res.send('API is running');
});

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chats', chatRoutes);

// ✅ Socket.io connection
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  // ❌ Removed socket.on("sendMessage") here
  // because we will emit from controller only

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected", socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

module.exports = { io }; // optional if you want to import io in controllers
