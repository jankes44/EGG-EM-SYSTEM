/*eslint-disable*/
import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Icon from "@material-ui/core/Icon";
// core components
import AdminNavbarLinks from "components/Navbars/AdminNavbarLinks.js";
import styles from "assets/jss/material-dashboard-react/components/sidebarStyle.js";
import jwt_decode from "jwt-decode";
import { withRouter } from "react-router-dom";
import { useLocation } from "react-router";

const useStyles = makeStyles(styles);

function Sidebar(props) {
  const classes = useStyles();
  // verifies if routeName is the one active (in browser input)
  function activeRoute(routeName) {
    return window.location.href.indexOf(routeName) > -1 ? true : false;
  }
  const token = localStorage.usertoken;
  const decoded = jwt_decode(token);
  const user = decoded;

  const checkIsAuthorized = () => {
    props.routes.map((el) => {
      if (el.layout + el.path === props.location.pathname) {
        if (el.access > user.access) {
          props.history.push("/noaccess");
        }
      }
    });
  };
  checkIsAuthorized();

  const { color, logo, image, logoText, routes } = props;
  var links = (
    <List className={classes.list}>
      {routes.map((prop, key) => {
        const token = localStorage.usertoken;
        const decoded = jwt_decode(token);
        const user = decoded;

        var activePro = " ";
        var listItemClasses;
        if (prop.path === "/") {
          listItemClasses = classNames({
            [" " + classes[color]]: true,
          });
        } else {
          listItemClasses = classNames({
            [" " + classes[color]]: activeRoute(prop.layout + prop.path),
          });
        }
        const whiteFontClasses = classNames({
          [" " + classes.whiteFont]: activeRoute(prop.layout + prop.path),
        });
        if (prop.access <= user.access) {
          return (
            <NavLink
              to={prop.layout + prop.path}
              className={activePro + classes.item}
              activeClassName="active"
              key={key}
            >
              <ListItem button className={classes.itemLink + listItemClasses}>
                {typeof prop.icon === "string" ? (
                  <Icon
                    className={classNames(classes.itemIcon, whiteFontClasses)}
                  >
                    {prop.icon}
                  </Icon>
                ) : (
                  <prop.icon
                    className={classNames(classes.itemIcon, whiteFontClasses)}
                  />
                )}
                <ListItemText
                  primary={props.rtlActive ? prop.rtlName : prop.name}
                  className={classNames(classes.itemText, whiteFontClasses)}
                  disableTypography={true}
                />
              </ListItem>
            </NavLink>
          );
        }
      })}
    </List>
  );

  return (
    <div>
      <Hidden mdUp implementation="css">
        <Drawer
          variant="temporary"
          anchor="left"
          open={props.open}
          classes={{
            paper: classNames(classes.drawerPaper),
          }}
          onClose={props.handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          <div className={classes.sidebarWrapper}>
            <AdminNavbarLinks />
            {links}
          </div>
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          variant="permanent"
          open
          classes={{
            paper: classNames(classes.drawerPaper),
          }}
        >
          <div className={classes.sidebarWrapper}>{links}</div>
          {image !== undefined ? <div className={classes.background} /> : null}
        </Drawer>
      </Hidden>
    </div>
  );
}

Sidebar.propTypes = {
  handleDrawerToggle: PropTypes.func,
  bgColor: PropTypes.oneOf(["purple", "blue", "green", "orange", "red"]),
  logo: PropTypes.string,
  image: PropTypes.string,
  logoText: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  open: PropTypes.bool,
};
export default withRouter(Sidebar);
