// @material-ui/core components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import LightsTable from "components/Data/LightsTable.js";
import GridContainer from "components/Grid/GridContainer.js";
// core components
import GridItem from "components/Grid/GridItem.js";
import React from "react";

export default function Reports() {
  return (
    <div>
      <GridContainer justify="center">
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardBody>
              <LightsTable />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
