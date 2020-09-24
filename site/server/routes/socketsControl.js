const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const onChange = require("on-change");
const _ = require("lodash");
const PORT_SOCKET = 5010;
var server = require("socket.io").listen(PORT_SOCKET);

let socketMessages = [];

let watchedObject = [];

server.on("connection", (socket) => {
  console.log("connected:", socket.id);
  socket.on("serverEvent", (data) => {
    watchedObject.push(data);
    // console.log(data.clientName, data.message);
  });
});

router.post("/test", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const socketId = req.body.socket;
      const { command } = req.body;
      let received = false;
      if (!received) {
        let packet = {
          sentBy: "SERVER",
          socket: socketId,
          command: command,
          type: "MANUAL",
        };
        server.emit(socketId, packet);

        watchedObject = onChange(socketMessages, function (path, value) {
          console.log(
            _.findLast(value, (el) => {
              return el.clientName === socketId;
            })
          );
          let lastMessage = _.findLast(value, (el) => {
            return el.clientName === socketId;
          });
          received = true;
          res.json(lastMessage);
        });
      }
      //   res.json("done");
    }
  });
});

module.exports = router;
