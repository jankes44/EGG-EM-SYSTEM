import React from "react";
import "./Console.css";
import LinearProgress from "@material-ui/core/LinearProgress";

const outputStyle = {
  width: "100%",
  fontSize: "1.5em",
  fontWeight: "100"
};

const ConsoleOutput = props => {
  return (
    <div>
      {props.active === true ? (
        <div style={outputStyle}>
          {props.user}: {props.content} on{" "}
          {props.choice === 1 ? (
            <div>group: {props.group}</div>
          ) : (
            <div>light: {props.light}</div>
          )}
          {props.minutes === 0 && props.seconds === 0 ? (
            <div>
              <p>
                {props.outPut}
                Test finished with {props.warning} warning/s
              </p>
            </div>
          ) : (
            <div>
              {props.isActive && (
                <div>
                  <p>
                    Time remaining: {props.minutes}m {props.seconds}s
                  </p>
                  <LinearProgress style={{ marginTop: "10px" }} />
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ConsoleOutput;
