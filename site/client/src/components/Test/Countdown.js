import React, { Component } from "react";
import moment from "moment";

export default class Countdown extends Component {
  state = {
    timer: "",
  };

  componentDidMount() {
    var duration = moment.duration(this.props.duration);
    var timestamp = new Date();
    var interval = 1;
    var timer = setInterval(() => {
      timestamp = new Date(timestamp.getTime() + interval * 1000);

      duration = moment.duration(duration.asSeconds() - interval, "seconds");
      var hr = duration.hours();
      var min = duration.minutes();
      var sec = duration.seconds();

      sec -= 1;
      if (min < 0) return clearInterval(timer);
      if (min < 10 && min.length !== 2) min = "0" + min;
      if (sec < 0 && min !== 0) {
        min -= 1;
        sec = 59;
      } else if (sec < 10 && sec.length !== 2) sec = "0" + sec;

      this.setState({ timer: `${hr}:${min}:${sec}` });
      if (min === 0 && sec === 0) clearInterval(timer);
    }, 1000);
  }

  render() {
    return <div> {this.state.timer}</div>;
  }
}
