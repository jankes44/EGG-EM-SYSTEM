import React from "react";
import LiveLights from "components/Test/LiveLights";
import LiveSensors from "components/Test/LiveSensors";
import axios from "axios";
import Skeleton from "@material-ui/lab/Skeleton";
import { Button } from "@material-ui/core";

export default function Overwatch(props) {
  const [lights, setLights] = React.useState([]);
  const [response, setResponse] = React.useState(false);
  const [mode, setMode] = React.useState("EM");
  const [sensors, setSensors] = React.useState([]);

  const callLightsFloorplans = () => {
    axios
      .get(global.BASE_URL + "/api/lights/level/" + props.clickedLevel, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        if (response.data.length > 0) {
          setLights(response.data);
          props.setClickedGroup(response.data[0].lgt_groups_id);
          setResponse(true);
        } else {
          setLights([]);
          setResponse(true);
        }
      });
  };

  const callSensorsFloorplans = () => {
    axios
      .get(global.BASE_URL + "/api/sensors/level/" + props.clickedLevel, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        console.log(response);
        if (response.data.length > 0) {
          setSensors(response.data);
          setResponse(true);
        } else {
          setSensors([]);
          setResponse(true);
        }
      });
  };

  const assignLight = (light) => {
    console.log(light);
    setLights((prevLights) => [...prevLights, light]);
    axios
      //route to lights of group id = this.state.rowId
      .post(
        global.BASE_URL + "/api/lights/edit/" + light.id,
        { levels_id: props.clickedLevel },
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
        }
      )
      .then((response) => {
        console.log(response);
      });
  };

  const assignSensor = (sensor) => {
    console.log(sensor);
    setSensors((prevSensors) => [...prevSensors, sensor]);
    axios
      //route to lights of group id = this.state.rowId
      .post(
        global.BASE_URL + "/api/sensors/assign/" + sensor.id,
        { levels_id: props.clickedLevel },
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
        }
      )
      .then((response) => {
        console.log(response);
      });
  };

  React.useEffect(() => {
    callLightsFloorplans();
    callSensorsFloorplans();
    //eslint-disable-next-line
  }, []);
  return (
    <div>
      <Button
        color="primary"
        variant="outlined"
        style={{ display: "inline-block", margin: "5px" }}
        onClick={() => setMode("EM")}
      >
        Em fittings
      </Button>
      <Button
        color="primary"
        variant="outlined"
        style={{ display: "inline-block", margin: "5px" }}
        onClick={() => setMode("SE")}
      >
        Sensors
      </Button>
      {response ? (
        mode === "EM" ? (
          <LiveLights
            clickedBuilding={props.clickedBuilding}
            clickedLevel={props.clickedLevel}
            liveDevices={lights}
            clickedGroup={props.clickedGroup}
            assignLight={assignLight}
            refreshData={callLightsFloorplans}
          />
        ) : (
          <LiveSensors
            clickedBuilding={props.clickedBuilding}
            clickedLevel={props.clickedLevel}
            liveDevices={sensors}
            clickedGroup={props.clickedGroup}
            assignSensor={assignSensor}
            refreshData={callSensorsFloorplans}
          />
        )
      ) : (
        <div>
          <Skeleton variant="text" height="100px" />
          <span />
          <Skeleton variant="rect" width="100%" height="80vh" />
        </div>
      )}
    </div>
  );
}
