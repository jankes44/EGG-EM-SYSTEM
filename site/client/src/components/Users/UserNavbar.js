import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { grayColor, hexToRgb } from "assets/jss/material-dashboard-react.js";
import decode from "jwt-decode";
import logo from "assets/img/egg.png";
import dashboardRoutes from "../../routes.js";
import nav from "./nav.css";

class UserNavbar extends Component {
  constructor() {
    super();
    this.state = {
      first_name: "",
      last_name: "",
      email: "",
      errors: {},
      isHidden: true,
    };
  }

  logOut(e) {
    e.preventDefault();
    localStorage.removeItem("usertoken");
    this.props.history.push(`/`);
  }

  componentDidMount() {
    if (localStorage.usertoken) {
      const decoded = decode(localStorage.usertoken);
      this.setState({
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        email: decoded.email,
      });
    }
  }

  render() {
    const loginRegLink = (
      <ul className="navbar-nav">
        <li className="nav-item btn" style={{ fontSize: "1.1em" }}>
          <Link to="/login" className="nav-link text-white">
            Sign in
          </Link>
        </li>
      </ul>
    );

    const userLink = (
      <div>
        <ul className="navbar-nav">
          <li className="nav-item btn">
            <Link
              to="/admin/profile"
              className="nav-link btn text-white"
              style={{ fontSize: "1.45em" }}
            >
              {this.state.first_name} {this.state.last_name}
            </Link>
          </li>
          <li className="nav-item btn">
            <div
              onClick={this.logOut.bind(this)}
              className="nav-link btn text-white"
              style={{ fontSize: "1.45em" }}
            >
              Logout
            </div>
          </li>
        </ul>
      </div>
    );

    let comp = loginRegLink;

    if (localStorage.usertoken) {
      const { exp } = decode(localStorage.usertoken);
      if (exp < new Date().getTime() / 1000) {
        comp = loginRegLink;
      } else comp = userLink;
    }
    return (
      <nav
        className="navbar navbar-expand-lg navbar-dark text-white fixed-top"
        style={{
          backgroundColor: "rgba(" + hexToRgb(grayColor[8]) + ")",
          marginBottom: "-70px",
          fontSize: "1.3em",
          boxShadow: "0px 10px 15px -12px rgba(0,0,0,0.6)",
          height: "10vh",
        }}
        id="navMedia"
      >
        {" "}
        {this.state.isHidden ? null : (
          <div
            style={{
              top: "10vh",
              left: "-5px",
              height: "300px",
              width: "20vw",
              position: "absolute",
              backgroundColor: "#333333",
              borderRadius: "0px 0px 3px 3px",
              overflowY: "scroll",
            }}
          >
            <ul style={{ display: "inline" }}>
              {dashboardRoutes.map((item, index) => (
                <li key={index} style={{ textDecoration: "none" }}>
                  <Link
                    to={"/admin" + item.path}
                    onClick={() => {
                      this.setState({ isHidden: !this.state.isHidden });
                    }}
                  >
                    <p
                      style={{
                        fontSize: "1em",
                        marginLeft: "10px",
                        textDecoration: "none",
                        color: "white",
                      }}
                    >
                      {item.name}
                    </p>
                  </Link>
                </li>
              ))}{" "}
              <div
                style={{
                  textAlign: "left",
                  float: "left",
                  fontSize: "1.1em",
                }}
              >
                {comp}
              </div>
            </ul>
          </div>
        )}
        {localStorage.usertoken ? (
          <button
            className="navbar-toggler float-right"
            style={{ marginTop: "-1vh", height: "7vh" }}
            type="button"
            data-toggle="collapse"
            data-target="#navbarsExample10"
            aria-controls="navbarsExample10"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={() => this.setState({ isHidden: !this.state.isHidden })}
          >
            <span
              className="navbar-toggler-icon"
              style={{ height: "5vh", color: "white" }}
            />
          </button>
        ) : null}
        <Link
          className="navbar-brand float-left font-weight-light"
          to="/admin/dashboard"
        >
          <img
            src={logo}
            width="30vw"
            height="30vh"
            className="d-inline-block align-top"
            alt="Logo"
          />
          {/** */} EmergencyEgg
        </Link>
        <div
          className="collapse navbar-collapse justify-content-md-end"
          id="navbarsExample10"
        >
          {comp}
        </div>
      </nav>
    );
  }
}

export default withRouter(UserNavbar);
