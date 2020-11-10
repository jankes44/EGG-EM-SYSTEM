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
  const [sensors] = React.useState([
    {
      id: 1,
      lgt_groups_id: 1,
      node_id: "000B",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 2,
      type: "F-51E",
      status: "OK",
      created_at: "2020-03-12 09:54:08",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 535,
      fp_coordinates_bot: 185,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 2,
      lgt_groups_id: 1,
      node_id: "000D",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 19,
      type: "EX-58",
      status: "OK",
      created_at: "2020-03-12 09:54:08",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 660,
      fp_coordinates_bot: 185,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 3,
      lgt_groups_id: 1,
      node_id: "000F",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 18,
      type: "EX-58",
      status: "OK",
      created_at: "2020-03-12 12:50:29",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 700,
      fp_coordinates_bot: 125,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 9,
      lgt_groups_id: 9,
      node_id: "000M",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 29,
      type: "F-51E",
      status: "OK",
      created_at: "2020-03-17 17:18:25",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 0,
      fp_coordinates_bot: 0,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 10,
      lgt_groups_id: 10,
      node_id: "000N",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 66,
      type: "S-25AE",
      status: "OK",
      created_at: "2020-03-19 16:11:38",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 0,
      fp_coordinates_bot: 0,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 11,
      lgt_groups_id: 11,
      node_id: "000O",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 48,
      type: "F-58E",
      status: "OK",
      created_at: "2020-03-19 16:11:38",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 0,
      fp_coordinates_bot: 0,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 12,
      lgt_groups_id: 12,
      node_id: "000P",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 57,
      type: "F-58E",
      status: "OK",
      created_at: "2020-03-19 16:11:38",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 0,
      fp_coordinates_bot: 0,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 13,
      lgt_groups_id: 13,
      node_id: "000R",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 47,
      type: "F-53E",
      status: "OK",
      created_at: "2020-03-19 16:11:38",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 0,
      fp_coordinates_bot: 0,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 14,
      lgt_groups_id: 14,
      node_id: "000S",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 53,
      type: "F-53E",
      status: "OK",
      created_at: "2020-03-19 16:11:38",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 0,
      fp_coordinates_bot: 0,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 15,
      lgt_groups_id: 17,
      node_id: "000T",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 109,
      type: "F-51E",
      status: "OK",
      created_at: "2020-04-02 23:01:56",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 0,
      fp_coordinates_bot: 0,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 16,
      lgt_groups_id: 17,
      node_id: "000U",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 89,
      type: "EX-58",
      status: "OK",
      created_at: "2020-04-02 23:01:59",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 0,
      fp_coordinates_bot: 0,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 17,
      lgt_groups_id: 15,
      node_id: "000V",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 114,
      type: "F-51E",
      status: "OK",
      created_at: "2020-04-02 23:02:04",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 0,
      fp_coordinates_bot: 0,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 18,
      lgt_groups_id: 1,
      node_id: "000W",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 17,
      type: "S-25E",
      status: "OK",
      created_at: "2020-04-03 02:31:11",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 830,
      fp_coordinates_bot: 65,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 19,
      lgt_groups_id: 1,
      node_id: "000Y",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 15,
      type: "EX-58",
      status: "OK",
      created_at: "2020-04-03 02:31:57",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 420,
      fp_coordinates_bot: 330,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 21,
      lgt_groups_id: 1,
      node_id: "000Z",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 39,
      type: "EX-58",
      status: "OK",
      created_at: "2020-04-03 14:15:35",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 230,
      fp_coordinates_bot: 0,
      comment: null,
      is_assigned: 1,
    },
    {
      id: 23,
      lgt_groups_id: 15,
      node_id: "00AE",
      light_node_id: null,
      volt_reading_node_id: null,
      device_id: 186,
      type: "EX-58",
      status: "OK",
      created_at: "2020-04-09 16:51:42",
      updated_at: "2020-10-28 15:42:38",
      fp_coordinates_left: 0,
      fp_coordinates_bot: 0,
      comment: null,
      is_assigned: 1,
    },
  ]);

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

  React.useEffect(() => {
    callLightsFloorplans();
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
            assignLight={assignLight}
            refreshData={callLightsFloorplans}
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
