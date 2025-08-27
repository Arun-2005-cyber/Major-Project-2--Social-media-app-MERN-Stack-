const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const chatRoutes = require("./routes/chatRoutes");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config();

// ✅ Connect DB BEFORE creating app
connectDB();

// ✅ Initialize express app
const app = express();

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ✅ Allowed origins for frontend
const allowedOrigins = [
  "https://socia-media.netlify.app", // deployed frontend
  "http://localhost:3000",           // local frontend
];

// ✅ CORS middleware for Express
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ✅ Body parser
app.use(express.json());

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Attach socket.io with CORS
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Attach io to requests (if needed inside routes)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ API test route
app.get("/", (req, res) => {
  res.send("✅ API is running");
});

// ✅ Static uploads
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chats", chatRoutes);

// ✅ Socket.io connection handling
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // Join a chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  // Optional: relay message event if you later emit directly via socket
  socket.on("sendMessage", (msg) => {
    console.log("📩 Message received via socket:", msg);
    io.to(msg.chatId).emit("messageReceived", msg);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected", socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
