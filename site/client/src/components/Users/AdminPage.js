import React, { Component } from "react";
import Register from "components/Users/Register";
import SiteUserManagement from "components/SiteUserManagement/SiteUserManagement";
// import UserManagement from "components/UserManagement/UserManagement";
import axios from "axios";
import jwt_decode from "jwt-decode";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

export default class AdminComponent extends Component {
  state = {
    users: [],
    sites: [],
  };

  componentDidMount() {
    this.callUsers();
  }

  callUsers = () => {
    const decoded = jwt_decode(localStorage.usertoken);
    const access = decoded.access;
    const user = decoded.id;

    axios({
      //Axios GET request
      method: "get",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/rolesusers/users/" + user,
    })
      .then((res) => {
        let usersCopy = res.data;
        usersCopy.forEach((el) => {
          if (access > el.access) {
            el.canEdit = true;
          } else if (access <= el.access) {
            el.canEdit = false;
          }
        });
        this.setState({ users: usersCopy });
        this.callSites();
      })
      .catch((err) => console.log(err));
  };

  callSites = () => {
    const decoded = jwt_decode(localStorage.usertoken);
    const user = decoded.id;

    axios({
      //Axios GET request
      method: "get",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/sites/" + user,
    })
      .then((res) => {
        this.setState({ sites: res.data });
      })
      .catch((err) => console.log(err));
  };

  revokeAccess = (user, site) => {
    let users = this.state.users;
    const foundUser = users.findIndex((el) => el.id === user);

    users[foundUser].sites = users[foundUser].sites.replace(
      JSON.stringify(site),
      ""
    );
    console.log(foundUser);
    this.setState({ users: users }, () => console.log(this.state.users));
    axios({
      //Axios GET request
      method: "delete",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      // eslint-disable-next-line
      url: global.BASE_URL + "/api/sites/revoke/" + `${user}/${site}`,
    })
      .then((res) => {
        console.log(res);
        this.callUsers();
        this.callSites();
      })
      .catch((err) => console.log(err));
  };

  render() {
    return (
      <div>
        <GridContainer justify="center">
          {/* <GridItem sm={8}>
            <UserManagement
              callUsers={this.callUsers}
              users={this.state.users}
            />
          </GridItem> */}
          <GridItem sm={8}>
            <SiteUserManagement
              callUsers={this.callUsers}
              users={this.state.users}
              sites={this.state.sites}
              revokeAccess={this.revokeAccess}
            />
          </GridItem>
          <GridItem sm={4} className="jumbotron bg-light">
            <Register callUsers={this.callUsers} />
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}
