import "bootstrap/dist/css/bootstrap.css";
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import TestsTable from "./TestsTable";
import jwt_decode from "jwt-decode";

class GroupsTable extends Component {
  intervalTests = 0;

  constructor(props) {
    super(props);
    this.state = {
      tests: [],
      showPopup: false,
      rowId: "",
    };
  }

  togglePopup = () => {
    this.setState({
      showPopup: !this.state.showPopup,
    });
  };

  componentDidMount() {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const usersId = decoded.id;
    fetch(global.BASE_URL + "/api/tests/usr/" + usersId, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
    })
      .then((results) => results.json())
      .then((data) => {
        this.setState({ tests: data });
      })
      .catch(function(error) {
        console.log(error);
      });
    this.intervalTests = setInterval(() => {
      fetch(global.BASE_URL + "/api/tests/usr/" + usersId, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
        .then((results) => results.json())
        .then((data) => {
          this.setState({ tests: data });
        })
        .catch(function(error) {
          console.log(error);
        });
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalTests);
  }

  render() {
    return (
      <div>
        <TestsTable tests={this.state.tests} />
      </div>
    );
  }
}

export default withRouter(GroupsTable);
