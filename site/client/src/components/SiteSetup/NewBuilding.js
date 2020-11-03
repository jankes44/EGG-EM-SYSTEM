import React, { useState, useEffect } from "react";
import GridContainer from "components/Grid/GridContainer";
import { Icon, IconButton } from "@material-ui/core";

export default function NewBuilding(props) {
  //eslint-disable-next-line

  let textInput = null;
  useEffect(() => {
    textInput.focus();
    //eslint-disable-next-line
  }, []);

  return (
    <GridContainer
      style={{
        border: "1px solid lightblue",
        padding: "5px",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          margin: "-5px",
        }}
      >
        <input
          ref={(input) => {
            textInput = input;
          }}
          label="Name"
          placeholder="Building name"
          className="form-control"
          style={{ margin: "15px", width: "31%", display: "inline-block" }}
          onChange={(e) => props.setBuildingName(e)}
        />
        <div
          style={{
            height: "100%",
            width: "1px",
            backgroundColor: "#DDE2E6",
            display: "inline-block",
          }}
        />
        <input
          label="Address"
          placeholder="Building address"
          className="form-control"
          style={{ margin: "15px", width: "31%", display: "inline-block" }}
          onChange={(e) => props.setBuildingAddress(e)}
        />

        <IconButton
          style={{ float: "right", textAlign: "center" }}
          color="primary"
          onClick={() => props.saveNewBuilding()}
        >
          <Icon style={{ fontSize: "1.3em" }}>check_circle</Icon>
        </IconButton>
      </div>
    </GridContainer>
  );
}
