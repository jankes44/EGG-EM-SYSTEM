import React, { Component } from "react";
import Sites from "components/DevTestSockets/Sites";
import jwt_decode from "jwt-decode";
import axios from "axios";

export default class DevTestSockets extends Component {
  state = {
    sites: [],
  };

  componentDidMount() {
    this.callSites();
  }

  callSites = () => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const usersId = decoded.id;

    axios
      .get(global.BASE_URL + "/api/sites/" + usersId, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        if (response.data.length) {
          this.setState({
            sites: response.data,
            clickedSite: response.data[0].sites_id,
          });
        }
      });
  };

  render() {
    return (
      <div>
        <Sites sites={this.state.sites} clickedSite={this.state.clickedSite} />
      </div>
    );
  }
}
