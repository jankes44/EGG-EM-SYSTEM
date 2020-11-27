import React from "react";
import LiveLights from "components/LiveFloorplans/LiveLights";
import LiveSensors from "components/LiveFloorplans/LiveSensors";
import axios from "axios";
import Skeleton from "@material-ui/lab/Skeleton";
import { Button } from "@material-ui/core";
import Power from "components/power/Dashboard";


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
        global.BASE_URL + "/api/lights/assign/" + light.id,
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
    const interval = setInterval(() => {
      callLightsFloorplans();
      callSensorsFloorplans();
    }, 10000);
    return () => clearInterval(interval);
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
            assignLight={assignLight}
            refreshData={callLightsFloorplans}
          />
        ) : (
          <div>
          <LiveSensors
            clickedBuilding={props.clickedBuilding}
            clickedLevel={props.clickedLevel}
            liveDevices={sensors}
            assignSensor={assignSensor}
            refreshData={callSensorsFloorplans}
          />
          <Power onlyGraph/>
          </div>
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
