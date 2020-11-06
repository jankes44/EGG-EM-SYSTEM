// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import GridContainer from "components/Grid/GridContainer.js";
// core components
import GridItem from "components/Grid/GridItem.js";
// import TestComp from "components/Data/TestsTableSelf.js";
import TestCompTrial from "components/Data/TrialTestsTableSelf";
import React from "react";

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
};

const lightText = {
  fontWeight: "100",
  textDecoration: "none",
  marginBottom: "20px",
};

const useStyles = makeStyles(styles);

export default function TableList() {
  const classes = useStyles();

  return (
    <div>
      {/**
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="success">
              <h4 className={classes.cardTitleWhite}>Users Table</h4>
            </CardHeader>
            <CardBody>
              <UsersTable />
              <AddUser />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
       */}
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} style={{ textAlign: "center" }}>
          <h2 style={lightText}>Test history</h2>
        </GridItem>
      </GridContainer>
      <GridContainer justify="center">
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="success">
              <h4 className={classes.cardTitleWhite}>Test history</h4>
            </CardHeader>
            <CardBody>
              <TestCompTrial />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
