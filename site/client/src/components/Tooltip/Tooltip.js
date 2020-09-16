import React, { Component } from "react";
import {
  //   transition,
  boxShadow,
  defaultFont,
} from "assets/jss/material-dashboard-react.js";

export default class Tooltip extends Component {
  state = {
    showTooltip: true,
  };
  render() {
    var color = "gray";
    var fontColor = "white";

    switch (this.props.color) {
      case "green":
        color = "#3DF68E";
        break;
      case "blue":
        color = "#00BFD3";
        break;
      case "red":
        color = "#DA242A";
        break;
      case "yellow":
        color = "#FFCA28";
        break;
      case "white":
        color = "white";
        fontColor = "black";
        break;
      default:
        color = "gray";
    }

    const toolTipContainer = {
      position: "relative",
      cursor: "pointer",
      opacity: "0.8",
    };

    const toolTipLabel = {
      ...defaultFont,
      height: "auto",
      width: "auto",
      maxWidth: "20vw",
      color: fontColor,
      backgroundColor: color,
      border: "1pt solid transparent",
      borderRadius: "3px",
      boxShadow: "5px 5px",
      padding: "5px",
      fontSize: "1.3em",
      ...boxShadow,
    };

    const toolTipArrow = {
      marginLeft: "5vw",
      height: "0",
      width: "0",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderTop: "15px solid " + color + "",
      borderRadius: "1px",
    };
    return (
      <div>
        {this.state.showTooltip ? (
          <div
            style={toolTipContainer}
            onClick={() => {
              this.setState({ showTooltip: false });
            }}
          >
            <div style={toolTipLabel}>
              <p>{this.props.label}</p>
            </div>
            <div style={toolTipArrow} />
          </div>
        ) : null}
      </div>
    );
  }
}
