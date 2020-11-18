import React, { Component } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import TrialTestsTable from "components/Data/TrialTestsTable";

export default class TrialTestsTableSelf extends Component {
  intervalTests = 0;
  state = {
    trialTests: [],
  };

  componentDidMount() {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded.id;
    axios({
      //Axios GET request
      method: "get",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/trialtests/usr/" + user,
    }).then((res) => {
      this.setState({
        trialTests: res.data,
      });
    });
    this.intervalTests = setInterval(() => {
      axios({
        //Axios GET request
        method: "get",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
        url: global.BASE_URL + "/api/trialtests/usr/" + user,
      }).then((res) => {
        this.setState({
          trialTests: res.data,
        });
      });
    }, 30000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalTests);
  }

  render() {
    return <TrialTestsTable tests={this.state.trialTests} />;
  }
}
