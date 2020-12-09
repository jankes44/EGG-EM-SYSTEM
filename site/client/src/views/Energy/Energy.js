// core components
import GridItem from "components/Grid/GridItem.js";
import React from "react";
// @material-ui/core components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import GridContainer from "components/Grid/GridContainer.js";
import Power from "components/power/Dashboard";
import { makeStyles } from "@material-ui/core/styles";

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

export default function Reports() {
  const classes = useStyles();

  return (
    <div>
      <GridContainer justify="center">
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="success">
              <h4 className={classes.cardTitleWhite}>Energy overview</h4>
            </CardHeader>
            <CardBody>
              <Power />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
