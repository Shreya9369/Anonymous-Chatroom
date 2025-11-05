const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } }); 

app.use(express.static(path.join(__dirname, "../frontend")));

io.on("connection", (socket) => {
  console.log("🟢 User connected");

  socket.on("chat message", (data) => io.emit("chat message", data));
  
  socket.on("disconnect", () => console.log("🔴 User disconnected"));
});

server.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
