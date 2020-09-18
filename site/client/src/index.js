import React from "react";
import ReactDOM from "react-dom";
import { createBrowserHistory } from "history";
// import {createBrowserHistory} from "history";
import { Route, Switch, Redirect, Router } from "react-router-dom";
// import { Router } from "react-router-dom";
// import { useHistory } from "react-router";
import PropTypes from "prop-types";
// import Error from "components/ErrorBoundary/Error";

// core components
import Admin from "layouts/Admin.js";
import Guest from "layouts/Guest.js";
import LoginPage from "views/LoginPage/LoginPage";
import NotAuthorized from "views/Notauthorized/Notauthorized";
// import RegisterPage from "views/RegisterPage/RegisterPage";
import "typeface-roboto";
import decode from "jwt-decode";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

const hist = createBrowserHistory({
  basename: "#",
});

global.BASE_URL = "http://63.32.97.125:5000";
global.intervalCheck = false;

const checkAuth = () => {
  const token = localStorage.getItem("usertoken");

  if (!token) {
    return false;
  }

  try {
    const { exp } = decode(token);

    // console.log(dToken);
    // console.log(exp);
    // console.log(new Date().getTime());

    //check if token not expired
    if (exp < new Date().getTime() / 1000) {
      return false;
    }

    //check if token expiry var defined
    if (!exp) {
      return false;
    }
    // if (alg != )
  } catch (err) {
    return <h1>Error: {err}</h1>;
  }
  return true;
};

const CheckAuthInterval = () => {
  if (global.intervalCheck === false) {
    global.intervalCheck = true;
    const interval = setInterval(() => {
      if (checkAuth() === false) {
        hist.push("/noaccess");
        console.log("Authorized:", checkAuth());
        global.intervalCheck = false;
        clearInterval(interval);
      }
    }, 10000);
  }
  return null;
};

const AuthRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      checkAuth() ? (
        <div>
          <CheckAuthInterval />
          <Component {...props} />
        </div>
      ) : (
        <div>
          <Redirect to={{ exact: "/#/login" }} />
          <p>Session Expired</p>
        </div>
      )
    }
  />
);

AuthRoute.propTypes = {
  component: PropTypes.func.isRequired,
};

ReactDOM.render(
  <Router history={hist}>
    <Switch>
      <Route path="/guest" component={Guest} />
      <AuthRoute path="/admin" component={Admin} />
      <Route exact path="/login" component={LoginPage} />
      <Route exact path="/noaccess" component={NotAuthorized} />
      {/* <Route path="/register" component={RegisterPage} /> */}
      <Redirect from="/" to="/login" />
    </Switch>
  </Router>,
  document.getElementById("root")
);
