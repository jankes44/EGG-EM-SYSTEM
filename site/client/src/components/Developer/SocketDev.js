import React, { Component } from "react";
import axios from "axios";

export default class SocketDev extends Component {
  state = {
    command: "",
    socket: "TEST_SOCKET",
    messages: [],
  };

  onChange = (e) => {
    this.setState({ command: e.target.value });
  };

  componentDidMount() {
    axios({
      method: "get",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/trialtests/usr/6/20",
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  send = () => {
    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/sockets/test",
      data: {
        socket: this.state.socket,
        command: this.state.command,
      },
      timeout: 0,
    })
      .then((res) => {
        console.log(res);
        this.setState({ messages: [...this.state.messages, res.data] });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  onChangeRadio = (changeEvent) => {
    this.setState({
      socket: changeEvent.target.value,
    });
  };

  render() {
    return (
      <div>
        <input type="text" onChange={this.onChange} />
        <button onClick={this.send}>send</button>
        <h5>{this.state.command}</h5>
        <label>
          <input
            type="radio"
            value="TEST_SOCKET"
            checked={"TEST_SOCKET" === this.state.socket}
            onChange={this.onChangeRadio}
          />
          TEST_SOCKET
        </label>
        <label>
          <input
            type="radio"
            value="SP_SOCKET"
            checked={"SP_SOCKET" === this.state.socket}
            onChange={this.onChangeRadio}
          />
          SP_SOCKET
        </label>
        <h5>{this.state.socket}</h5>
        <ul>
          {this.state.messages.map((el, index) => {
            if (el.message.devices) {
              return (
                <li key={index}>
                  {el.clientName} - ID: {el.message.test_id}
                  {" DEVICES: "}
                  {el.message.devices.map((c, i) => (
                    <p key={i}>
                      {c.blabla} {c.omnom}
                    </p>
                  ))}
                </li>
              );
            } else
              return (
                <li key={index}>
                  {el.clientName} - {el.message}
                </li>
              );
          })}
        </ul>
      </div>
    );
  }
}
