// @material-ui/core components
// import { makeStyles } from "@material-ui/core/styles";
import GridContainer from "components/Grid/GridContainer.js";
// core components
import GridItem from "components/Grid/GridItem.js";
import React from "react";
import DeveloperComp from "components/Developer/Developer";
import Maps from "components/Maps/Maps";

export default function Developer() {
  // const classes = useStyles();
  return (
    <div>
      <GridContainer justify="center">
        <GridItem xs={12} sm={12} md={12}>
          <h1>Developer page, access only for developers</h1>
        </GridItem>
        <GridItem xs={12}>
          <DeveloperComp />
        </GridItem>
      </GridContainer>
      {/* <GridContainer justify="center">
        <GridItem xs={12}>
          <Maps />
        </GridItem>
      </GridContainer> */}
    </div>
  );
}
