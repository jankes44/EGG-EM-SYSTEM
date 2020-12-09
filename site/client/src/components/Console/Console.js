import React from "react";
import ConsoleOutput from "./ConsoleOutput";

const consoleStyle = {
  marginTop: "30px",
  width: "100%",
  height: "25vh",
  borderRadius: "2px",
  padding: "15px",
  background: "whitesmoke"
};

const Console = props => {
  return (
    <div style={consoleStyle}>
      <ConsoleOutput
        user={props.user}
        timeStamp={props.timeStamp}
        content={props.content}
        displayLoading={props.displayLoading}
        isActive={props.isActive}
        minutes={props.minutes}
        seconds={props.seconds}
        send={props.send}
        warning={props.warning}
        active={props.active}
        group={props.group}
        light={props.light}
        choice={props.choice}
        failed={props.failed}
      />
    </div>
  );
};

export default Console;
