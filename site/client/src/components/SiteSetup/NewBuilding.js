import React, { useEffect, useState } from "react";
import { InputLabel, TextField, Slider, Button } from "@material-ui/core";

export default function NewBuilding(props) {
  const [levelCount, setLevelCount] = useState(1);
  const [buildingName, setBuildingName] = useState("");

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        backgroundColor: "whitesmoke",
        padding: "10px",
      }}
    >
      <h5>Create new building</h5>
      <div
        style={{
          width: "100%",
          backgroundColor: "black",
          height: "1px",
          marginBottom: "20px",
        }}
      />
      <InputLabel htmlFor="age-native-simple">Building name</InputLabel>
      <TextField
        id="outlined-basic"
        label="Name"
        variant="outlined"
        style={{ marginBottom: "20px" }}
        onChange={(e) => setBuildingName(e.target.value)}
      />
      <InputLabel htmlFor="age-native-simple">Level count</InputLabel>
      <Slider
        defaultValue={1}
        valueLabelDisplay="auto"
        step={1}
        marks={true}
        min={1}
        max={80}
        onChange={(e, val) => setLevelCount(val)}
      />
      <Button
        color="primary"
        //   onClick={this.handleCreateBuilding}
      >
        Create
      </Button>
    </div>
  );
}
