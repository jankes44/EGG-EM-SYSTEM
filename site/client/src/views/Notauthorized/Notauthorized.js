// @material-ui/core components
// import { makeStyles } from "@material-ui/core/styles";
import GridContainer from "components/Grid/GridContainer.js";
// core components
import GridItem from "components/Grid/GridItem.js";
import React from "react";
import Button from "@material-ui/core/Button";

export default function Developer(props) {
  // const classes = useStyles();

  setTimeout(() => {
    props.history.push("/admin/dashboard");
  }, 4000);
  return (
    <div>
      <GridContainer justify="center">
        <GridItem xs={12} sm={12} md={12}>
          <div style={{ margin: "30px" }}>
            <h2>No access/timed out</h2>
            <Button
              variant="contained"
              color="primary"
              style={{ fontSize: "em" }}
              onClick={() => props.history.push("/admin/dashboard")}
            >
              Continue
            </Button>
          </div>
        </GridItem>
      </GridContainer>
    </div>
  );
}
