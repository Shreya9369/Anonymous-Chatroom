const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const mysql = require("mysql2");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, "../frontend")));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Shreya@123",
  database: "anonymous_chatroom"
});

db.connect((err) => {
  if (err) {
    console.log("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

let onlineUsers = 0;

io.on("connection", (socket) => {
  console.log("🟢 User connected");

  onlineUsers++;
  io.emit("user count", onlineUsers);

  socket.on("chat message", (data) => {
    io.emit("chat message", {
      text: data.text,
      nickname: data.nickname,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    });
  });

  socket.on("user joined", (nickname) => {
    socket.nickname = nickname;
    io.emit("system message", `${nickname} joined the chat`);
  });

  socket.on("typing", (nickname) => {
    socket.broadcast.emit("typing", nickname);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");

    onlineUsers--;
    io.emit("user count", onlineUsers);

    if (socket.nickname) {
      io.emit("system message", `${socket.nickname} left the chat`);
    }
  });
});

server.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});