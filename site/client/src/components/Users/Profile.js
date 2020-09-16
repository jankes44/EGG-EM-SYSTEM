import React, { Component } from "react";
import jwt_decode from "jwt-decode";

class Profile extends Component {
  constructor() {
    super();
    this.state = {
      first_name: "",
      last_name: "",
      email: "",
      errors: {},
      access: "",
    };
  }

  componentDidMount() {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    let access = decoded.role_name;

    this.setState({
      first_name: decoded.first_name,
      last_name: decoded.last_name,
      email: decoded.email,
      access: access,
    });
  }

  render() {
    return (
      <div className="container">
        <div className="jumbotron jumbotron-fluid">
          <div className="col-sm-8 mx-auto">
            <h1 className="text-center">PROFILE</h1>
          </div>
          <table className="table col-md-6 mx-auto">
            <tbody>
              <tr>
                <td>First Name</td>
                <td>{this.state.first_name}</td>
              </tr>
              <tr>
                <td>Last Name</td>
                <td>{this.state.last_name}</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>{this.state.email}</td>
              </tr>
              <tr>
                <td>Access role</td>
                <td>{this.state.access}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default Profile;
