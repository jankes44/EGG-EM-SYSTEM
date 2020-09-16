import React, { Component } from "react";
import { login, loginVar } from "./UserFunctions";
import { withRouter } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import { Animate } from "react-simple-animate";

class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      message: "",
      play: "",
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();

    const user = {
      email: this.state.email,
      password: this.state.password,
    };

    login(user).then((res) => {
      if (res) {
        this.props.history.push("/admin/dashboard");
      } else {
        this.setState({ message: loginVar, play: true });
      }
    });
  }

  render() {
    return (
      <div>
        <UserNavbar />
        <div className="container" style={{ marginTop: "50px" }}>
          <div className="row">
            <div className="col-md-6 mt-5 mx-auto">
              <form noValidate onSubmit={this.onSubmit}>
                <h1 className="h3 mb-3 font-weight-normal">Sign in</h1>
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
                </div>
                <button
                  type="submit"
                  className="btn btn-lg btn-primary btn-block"
                >
                  Sign in
                </button>
              </form>
              <Animate
                play={this.state.play} // Toggle when animation should start
                duration={0.5}
                start={{
                  backgroundColor: "transparent",
                  opacity: "0",
                }}
                end={{
                  opacity: "0.9",
                  backgroundColor: "red",
                  borderRadius: "5px",
                }}
              >
                <p
                  style={{
                    marginTop: "25px",
                    textAlign: "center",
                    color: "white",
                    fontSize: "1.5em",
                  }}
                >
                  {this.state.message}
                </p>
              </Animate>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);
