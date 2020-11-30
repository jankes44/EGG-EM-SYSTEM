import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Typography from "@material-ui/core/Typography";
import UploadCSV2 from "components/UploadCSV/UploadCSV.js";

const useStyles = makeStyles(styles);

export default function UploadCSV(props) {
  const classes = useStyles();

  if (props.history.location.state) {
    const { building } = props.history.location.state;
    console.log(building);

    return (
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <Card>
            <CardHeader color="success">
              <h4 className={classes.cardTitleWhite}>
                Upload Devices using CSV: {building.building}
              </h4>
            </CardHeader>
            <CardBody>
              <Typography variant="subtitle1">
                <UploadCSV2 building={building} />
              </Typography>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    );
  } else
    return (
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <Card>
            <CardHeader color="warning">
              <h4 className={classes.cardTitleWhite}>Upload Devices CSV</h4>
            </CardHeader>
            <CardBody>
              <Typography variant="subtitle1">
                Got lost? Return to dashboard to continue :)
              </Typography>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    );
}
