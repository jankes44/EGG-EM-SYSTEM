import React, { Component } from "react";
import { register } from "./UserFunctions";
import { withRouter } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import jwt_decode from "jwt-decode";

class Register extends Component {
  constructor() {
    super();
    this.state = {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      message: "",
      play: "",
      roles: [],
      sites: [],
      selectedRole: null,
      selectedSites: [],
      errors: {
        first_name: " ",
        last_name: " ",
        email: " ",
        password: " ",
        role: " ",
        site: " ",
      },
      formDisabled: true,
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  callSites = (user) => {
    axios
      .get(global.BASE_URL + "/api/sites/" + user.id, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        if (response.data.length) {
          let data = [];
          response.data.forEach((el) => {
            var site = {};
            site.value = el.sites_id;
            site.label = el.name;
            data.push(site);
          });
          this.setState({ sites: data });
        }
      });
  };

  componentDidMount() {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded;

    axios({
      //Axios POST request
      method: "get",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/rolesusers/" + user.access,
    })
      .then((res) => {
        let data = [];
        res.data.forEach((el) => {
          var role = {};
          role.value = el.id;
          role.label = el.name;
          role.accessLevel = el.access;
          data.push(role);
        });
        this.setState({
          roles: data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
    this.callSites(user);
  }

  validateForm = (errors) => {
    let valid = true;
    Object.values(errors).forEach(
      // if we have an error string set valid to false
      (el) => el.length > 0 && (valid = false)
    );
    return valid;
  };

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
    const { name, value } = e.target;
    let errors = this.state.errors;
    const validEmailRegex = RegExp(
      // eslint-disable-next-line
      /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    );

    switch (name) {
      case "first_name":
        errors.first_name =
          value.length < 3 ? "First Name minimum 3 characters long" : "";
        break;
      case "last_name":
        errors.last_name =
          value.length < 3 ? "Last Name minimum 3 characters long" : "";
        break;
      case "email":
        errors.email = validEmailRegex.test(value) ? "" : "Email is not valid";
        break;
      case "password":
        errors.password =
          value.length < 8 ? "Password minimum 8 characters long" : "";
        break;
      default:
        break;
    }
    this.setState({ errors, [name]: value }, () => {
      if (this.validateForm(errors)) {
        this.setState({ formDisabled: false });
      } else this.setState({ formDisabled: true });
    });
  }

  onChangeSelect = (selectedOption) => {
    let errors = this.state.errors;

    errors.role = selectedOption.length > 0 ? "Choose a role for the user" : "";
    this.setState({ selectedRole: selectedOption }, () => {
      if (this.validateForm(errors)) {
        this.setState({ formDisabled: false });
      }
    });
  };

  onChangeSelectSites = (selectedOption) => {
    let errors = this.state.errors;
    if (selectedOption) {
      if (selectedOption.length === 0) {
        errors.site = "Choose sites for the user";
      } else errors.site = "";
      this.setState({ selectedSites: selectedOption }, () => {
        if (this.validateForm(errors)) {
          this.setState({ formDisabled: false });
        } else this.setState({ formDisabled: true });
      });
    } else {
      errors.site = "Choose sites for the user";
      this.setState({ formDisabled: true });
    }
  };

  onSubmit(e) {
    e.preventDefault();
    if (this.validateForm(this.state.errors)) {
      const sites = [];

      this.state.selectedSites.forEach((el) => {
        sites.push(el.value);
      });

      const user = {
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        email: this.state.email,
        password: this.state.password,
        role: this.state.selectedRole.value,
        sites: sites,
      };

      register(user)
        .then((res) => {
          this.props.callUsers();
          console.log(res.data);
          this.setState({
            message: res.data.status,
          });
        })
        .catch((err) => {
          console.log(err.response);
          if (err.response) {
            this.setState({ message: err.response.data });
          }
        });
    } else {
      this.setState({ message: "Error in the form" });
      console.error("Invalid Form");
    }
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-12 mx-auto">
            <form noValidate onSubmit={this.onSubmit}>
              <h4>Register a new user</h4>
              <div className="form-group">
                <label htmlFor="firstname">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="first_name"
                  placeholder="Enter first name"
                  value={this.state.first_name}
                  onChange={this.onChange}
                />
                {this.state.errors.first_name ? (
                  <p>{this.state.errors.first_name}</p>
                ) : (
                  <p style={{ color: "green" }}>✓</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="lastname">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="last_name"
                  placeholder="Enter last name"
                  value={this.state.last_name}
                  onChange={this.onChange}
                />
                {this.state.errors.last_name ? (
                  <p>{this.state.errors.last_name}</p>
                ) : (
                  <p style={{ color: "green" }}>✓</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Enter email"
                  value={this.state.email}
                  onChange={this.onChange}
                />
                {this.state.errors.email ? (
                  <p>{this.state.errors.email}</p>
                ) : (
                  <p style={{ color: "green" }}>✓</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.onChange}
                />
                {this.state.errors.password ? (
                  <p>{this.state.errors.password}</p>
                ) : (
                  <p style={{ color: "green" }}>✓</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <Select
                  value={this.state.selectedRole}
                  onChange={this.onChangeSelect}
                  options={this.state.roles}
                />
                {this.state.errors.password ? (
                  <p>{this.state.errors.role}</p>
                ) : (
                  <p style={{ color: "green" }}>✓</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="site">Sites</label>
                <Select
                  closeMenuOnSelect={false}
                  value={this.state.selectedSite}
                  onChange={this.onChangeSelectSites}
                  options={this.state.sites}
                  isMulti
                />
                {this.state.errors.password ? (
                  <p>{this.state.errors.site}</p>
                ) : (
                  <p style={{ color: "green" }}>✓</p>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-lg btn-primary btn-block"
                disabled={this.state.formDisabled}
              >
                Register
              </button>
            </form>

            <p
              style={{
                marginTop: "25px",
                textAlign: "center",
                color: "black",
                fontSize: "1.5em",
              }}
            >
              {this.state.message}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Register);
