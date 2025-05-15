const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require('path');  // <-- Add this line

const { Server } = require("socket.io");

const app = express();
app.use(cors({
  origin: "http://localhost:5500", // frontend URL
  methods: ["GET", "POST"]
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5500",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get("/ping", (req, res) => {
  res.json({ message: "Server is working fine!" });
});

io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.on("chat message", (data) => {
    io.emit("chat message", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected");
  });
});

server.listen(5000, () => {
  console.log("✅ Server running at http://localhost:5000");
});
