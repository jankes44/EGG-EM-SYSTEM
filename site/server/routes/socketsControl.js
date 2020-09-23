const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const PORT_SOCKET = 5010;
var server = require("socket.io").listen(PORT_SOCKET);

server.on("connection", (socket) => {
  console.log("connected:", socket.id);
  socket.on("serverEvent", (data) => {
    console.log(data.clientName, data.message);
  });
  server.sockets.emit("SP_SOCKET", `SERVER: ${socket.id} Joined`);
});

router.post("/test", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const socketId = req.body.socket;
      const { command } = req.body;

      server.sockets.emit(socketId, `SERVER: ${command}`);
      res.json("done");
    }
  });
});

module.exports = router;
