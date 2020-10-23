const { device, topicSend } = require("./mqtt/connection");
const io = require("socket.io-client");
const DurationTest = require("./mqtt/DurationTest");
var socket = io.connect("http://localhost:5010/", {
  reconnection: true,
});
var clientName = "SP_SOCKET";

var testInProgress = false;

socket.on("connect", function () {
  console.log("connected to localhost:5010");
  //   socket.emit("serverEvent", `${clientName}: Hello from ${clientName}`);
  socket.on(clientName, function (packet) {
    if (packet.type === "AUTO")
      switch (packet.command) {
        case "TEST_DATA":
          getLiveTestData();
          break;
        case "TEST_DUR":
          startTest();
          break;
        case "TEST_DEV":
          testFunc();
          break;
        case "DURATION_TEST":
          let packet = {
            clientName: clientName,
            message: DurationTest.Init(),
            timestamp: new Date(),
          };
          socket.emit("serverEvent", packet);
          console.log(DurationTest.Init());
          break;
        case "STATUS":
          checkStatus();
      }
    if (packet.type === "MANUAL") {
      testFunc(packet.command);
    }
    if (packet.type === "VOLTAGE") {
      getVoltage(packet.command);
    }

    console.log(packet);
  });
  socket.on("disconnect", function () {
    console.log("disconnected");
  });
});

function checkStatus() {
  device.publish(topicSend, "XchkX", (err) => {
    console.log("check status");
    let timeout = setTimeout(() => {
      let packet = {
        clientName: clientName,
        message: {
          testInProgress: testInProgress,
          gwStatus: "NO RESPONSE - GATEWAY",
        },
        timestamp: new Date(),
      };
      socket.emit("serverEvent", packet);
      console.log("timeout");
    }, 5000);
    device.handleMessage = (message, callback) => {
      clearTimeout(timeout);
      var msg = message.payload.toString("utf8");
      console.log(msg);

      let gwStatus = "OK";
      if (msg.includes("STATE_OK")) {
        gwStatus = "OK";
      } else gwStatus = "FAULT";
      let packet = {
        clientName: clientName,
        message: { testInProgress: testInProgress, gwStatus: gwStatus },
        timestamp: new Date(),
      };
      console.log("checkStatus");
      socket.emit("serverEvent", packet);
      callback();
    };
  });
}

function getVoltage(node) {
  device.publish(topicSend, `${node}10038205000096`, { qos: 1 }, (err) => {
    let timestampSent = new Date();
    var msgTimeout = setTimeout(() => {
      let packet = {
        clientName: clientName,
        message: `${node}: NO RES`,
        timestamp: timestampSent,
      };
      socket.emit("serverEvent", packet);
    }, 6000);
    let received = 0;
    device.handleMessage = (packet, callback) => {
      let timestamp = new Date();
      var message = packet.payload.toString("utf8");
      if (received === 0) {
        clearTimeout(msgTimeout);
        received = 1;
        const msgSliced = parseInt(`0x${message.slice(21, 25)}`);
        let voltage = (msgSliced / 1241.212121 / 0.3).toFixed(3);
        console.log("mqttController:", message);
        let packet = {
          clientName: clientName,
          message: `${message}: ${voltage}v`,
          timestamp: timestamp,
        };
        socket.emit("serverEvent", packet);

        callback();
        return message;
      } else callback();
    };
  });
}

function testFunc(command) {
  device.publish(topicSend, command, { qos: 1 }, (err) => {
    let timestampSent = new Date();
    var msgTimeout = setTimeout(() => {
      let packet = {
        clientName: clientName,
        message: `${command}: NO RES`,
        timestamp: timestampSent,
      };
      socket.emit("serverEvent", packet);
    }, 6000);
    let received = 0;
    device.handleMessage = (packet, callback) => {
      let timestamp = new Date();
      var message = packet.payload.toString("utf8");
      if (received === 0) {
        clearTimeout(msgTimeout);
        received = 1;
        console.log("mqttController:", message);
        let packet = {
          clientName: clientName,
          message: message,
          timestamp: timestamp,
        };
        socket.emit("serverEvent", packet);

        callback();
        return message;
      } else callback();
    };
  });
}

getLiveTestData = () => {
  let timestamp = new Date();
  let testData = {
    test_id: Math.random() * 100,
    socket_id: clientName,
    devices: [
      { blabla: Math.random() * 100, omnom: Math.random() * 100 },
      { blabla: Math.random() * 100, omnom: Math.random() * 100 },
    ],
  };
  console.log("getdata");
  let packet = {
    clientName: clientName,
    message: testData,
    timestamp: timestamp,
  };
  socket.emit("serverEvent", packet);
};

startTest = () => {
  console.log("starttest");

  let timestamp = new Date();
  let testData = {
    test_id: Math.random() * 100,
    socket_id: clientName,
    devices: [
      { blabla: Math.random() * 100, omnom: Math.random() * 100 },
      { blabla: Math.random() * 100, omnom: Math.random() * 100 },
    ],
  };

  let packet = {
    clientName: clientName,
    message: `${clientName}: Test Initiating`,
    timestamp: timestamp,
  };
  console.log(packet);
  socket.emit("serverEvent", packet);
  testData.devices[1].blabla = 3;
};

module.exports = {
  testFunc,
};
