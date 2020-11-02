import React from "react";
import OverwatchFloorplan from "components/Test/OverwatchFloorplan";
import axios from "axios";
import Skeleton from "@material-ui/lab/Skeleton";

export default function Overwatch(props) {
  const [lights, setLights] = React.useState([]);
  const [response, setResponse] = React.useState(false);

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
          setTimeout(() => {
            setLights(response.data);
            props.setClickedGroup(response.data[0].lgt_groups_id);
            setResponse(true);
          }, 500);
        } else {
          console.log("ELSE");
          axios
            .get(
              global.BASE_URL + "/api/lights/nodevices/" + props.clickedLevel,
              {
                headers: {
                  "Content-Type": "application/json;charset=UTF-8",
                  Authorization: "Bearer " + localStorage.usertoken,
                },
              }
            )
            .then((response) => {
              console.log(response.data);
              setLights([]);
              if (response.data.length)
                props.setClickedGroup(response.data[0].id);
              setResponse(true);
            });
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
        { lgt_groups_id: props.clickedGroup },
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
      {response ? (
        <OverwatchFloorplan
          clickedBuilding={props.clickedBuilding}
          clickedLevel={props.clickedLevel}
          liveDevices={lights}
          clickedGroup={props.clickedGroup}
          assignLight={assignLight}
        />
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
