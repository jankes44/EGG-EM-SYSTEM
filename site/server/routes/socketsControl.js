const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const onChange = require("on-change");
const _ = require("lodash");
const { now } = require("lodash");
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

emitMessage = async (socket, packet) => {
  server.emit(socket, packet);
  let promise = new Promise((resolve, reject) => {
    let timeout = setTimeout(() => {
      let packetSend = {
        clientName: socket,
        message: {
          gwStatus: `NO RESPONSE - ${socket}`,
        },
        timestamp: new Date(),
      };
      reject(packetSend);
    }, 7000);
    watchedObject = onChange(socketMessages, function (path, value) {
      if (value[value.length - 1].clientName === "SP_SOCKET") {
        clearTimeout(timeout);
        console.log(
          _.findLast(value, (el) => {
            return el.clientName === socket;
          })
        );
        let lastMessage = _.findLast(value, (el) => {
          return el.clientName === socket;
        });
        resolve(lastMessage);
      }
    });
  });
  let result = await promise;
  return result;
};

router.post("/status", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const socketId = req.body.socket;
      const command = "STATUS";
      let received = false;
      if (!received) {
        let packet = {
          sentBy: "SERVER",
          socket: socketId,
          command: command,
          type: "AUTO",
        };
        emitMessage(socketId, packet)
          .then((socketRes) => {
            console.log(socketRes);
            res.json(socketRes);
          })
          .catch((err) => {
            console.log(err);
            res.json(err);
          });
      }
    }
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
          type: "AUTO",
        };
        // server.emit(socketId, packet);
        emitMessage(socketId, packet).then((msg) => {
          res.json(msg);
        });
      }
      //   res.json("done");
    }
  });
});

module.exports = router;
