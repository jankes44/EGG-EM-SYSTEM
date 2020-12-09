import React from "react";

const consoleInputStyle = {};

const container = {
  flex: "1",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f5fcff",
  borderWidth: "1",
  flexDirection: "row",
  flexWrap: "wrap"
};

const inputStyle = {
  width: "100%"
};

const ConsoleInput = () => {
  return (
    <div style={container}>
      <input type="text" name="name" style={inputStyle} />
    </div>
  );
};

export default ConsoleInput;
