// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TrialTestsTableSelf from "components/Data/TrialTestsTableSelf.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Welcome from "components/Welcome/Welcome.js";
import React from "react";

const useStyles = makeStyles(styles);

export default function Dashboard() {
  const classes = useStyles();

  return (
    <div>
      <GridContainer justify="center">
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <Welcome />
        </GridItem>
      </GridContainer>
      {/* <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitleWhite}>Site Map</h4>
            </CardHeader>
            <CardBody>
              <h1>Not completed</h1>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer> */}
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitleWhite}>Test History</h4>
            </CardHeader>
            <CardBody>
              <TrialTestsTableSelf />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
