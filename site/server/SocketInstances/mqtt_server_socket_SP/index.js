var io = require("socket.io-client");
var socket = io.connect("http://localhost:5010/", {
  reconnection: true,
});
var clientName = "TEST_SOCKET";
let testData;

socket.on("connect", function () {
  console.log("connected to localhost:5010");
  //   socket.emit("serverEvent", `${clientName}: Hello from ${clientName}`);
  socket.on(clientName, function (command) {
    switch (command) {
      case "SERVER: TEST_DATA":
        getLiveTestData();
        break;
      case "SERVER: TEST_DUR":
        startTest();
        break;
      case "do you think so?":
        socket.emit("serverEvent", "Yes.");
    }

    console.log(command);
  });
  socket.on("disconnect", function () {
    console.log("disconnected");
  });
});

getLiveTestData = () => {
  let testData = {
    test_id: Math.random() * 100,
    socket_id: clientName,
    devices: [
      { blabla: Math.random() * 100, omnom: Math.random() * 100 },
      { blabla: Math.random() * 100, omnom: Math.random() * 100 },
    ],
  };
  console.log("getdata");
  let packet = { clientName: clientName, message: testData };
  socket.emit("serverEvent", packet);
};

startTest = () => {
  console.log("starttest");

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
  };
  socket.emit("serverEvent", packet);
  testData.devices[1].blabla = 3;
};
