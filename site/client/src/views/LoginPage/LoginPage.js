// import { makeStyles } from "@material-ui/core/styles";
import GridContainer from "components/Grid/GridContainer.js";
// core components
import GridItem from "components/Grid/GridItem.js";
import React from "react";
import Login from "components/Users/Login";

export default function LoginPage() {
  // const classes = useStyles();
  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Login />
        </GridItem>
      </GridContainer>
    </div>
  );
}
