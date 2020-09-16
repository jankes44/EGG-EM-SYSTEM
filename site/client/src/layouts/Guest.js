// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/material-dashboard-react/layouts/adminStyle.js";
import Footer from "components/Footer/Footer.js";
import UserNavbar from "components/Users/UserNavbar";
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import routes from "routes.js";

const switchRoutes = (
  <Switch>
    {routes.map((prop, key) => {
      if (prop.layout === "/guest") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      }
      return null;
    })}
    <Redirect from="/guest" to="/guest/login" />
  </Switch>
);

const useStyles = makeStyles(styles);

export default function Guest({ ...rest }) {
  // styles
  const classes = useStyles();
  // ref to help us initialize PerfectScrollbar on windows devices
  const mainPanel = React.createRef();
  // states and functions

  const getRoute = () => {
    return window.location.pathname !== "/guest/maps";
  };

  // initialize and destroy the PerfectScrollbar plugin

  return (
    <div ref={mainPanel}>
      <UserNavbar />
      {/* On the /maps route we want the map to be on full screen - this is not possible if the content and conatiner classes are present because they have some paddings which would make the map smaller */}
      {getRoute() ? (
        <div className={classes.content}>
          <div className={classes.container}>{switchRoutes}</div>
        </div>
      ) : (
        <div className={classes.map}>{switchRoutes}</div>
      )}
      {getRoute() ? <Footer /> : null}
    </div>
  );
}
