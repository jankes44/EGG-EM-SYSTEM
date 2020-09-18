import React, { Component } from "react";
import axios from "axios";

export default class ManualCommand extends Component {
  state = {
    command: "",
    messages: ["Test message"],
  };

  sendCommand = () => {
    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/trialmqtt/dev/manual/cmd",
      data: {
        command: this.state.command,
        topic: global.SEND_TOPIC,
      },
      timeout: 0,
    })
      .then((res) => {
        console.log(res);
        this.setState({ messages: [...this.state.messages, res.data.message] });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  inputOnChange = (e) => {
    this.setState({ command: e.target.value });
  };

  render() {
    return (
      <div>
        <h4>Manual mqtt command</h4>

        <input type="text" onChange={this.inputOnChange} />
        <button onClick={this.sendCommand}>send</button>
        <ul>
          {this.state.messages.map((el, index) => (
            <li key={index}>{el}</li>
          ))}
        </ul>
      </div>
    );
  }
}
