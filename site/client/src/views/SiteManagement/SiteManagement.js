// @material-ui/core
import React from "react";
import Groups from "components/Data/Groups.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import { makeStyles } from "@material-ui/core/styles";
import Management from "components/Management/Management.js";
const styles = {
  cardCategoryWhite: {
    "&,& a,& a:hover,& a:focus": {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0",
    },
    "& a,& a:hover,& a:focus": {
      color: "#FFFFFF",
    },
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontSize: "65%",
      fontWeight: "400",
      lineHeight: "1",
    },
  },
  root: {
    height: "216",
    flexGrow: "1",
    maxWidth: "400",
  },
  lightText: {
    fontWeight: "100",
    textDecoration: "none",
    marginBottom: "20px",
  },
};

const useStyles = makeStyles(styles);

export default function Dashboard() {
  const classes = useStyles();
  return (
    <div>
      <Card>
        <CardHeader color="info">
          <h4 className={classes.cardTitleWhite}>Site Management</h4>
        </CardHeader>
        <Groups />
      </Card>
      <Card>
        <CardHeader color="info">
          <h4 className={classes.cardTitleWhite}>Site Management</h4>
        </CardHeader>
        <Management />
      </Card>
    </div>
  );
}
