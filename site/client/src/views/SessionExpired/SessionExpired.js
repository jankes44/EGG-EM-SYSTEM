// import { makeStyles } from "@material-ui/core/styles";
import GridContainer from "components/Grid/GridContainer.js";
// core components
import GridItem from "components/Grid/GridItem.js";
import React from "react";
import { Redirect } from "react-router-dom";

export default function LoginPage() {
  // const classes = useStyles();
  return (
    <div>
      <GridContainer justify="center">
        <GridItem xs={12} sm={12} md={12}>
          <h1>Session expired</h1>
        </GridItem>
      </GridContainer>
    </div>
  );
}
