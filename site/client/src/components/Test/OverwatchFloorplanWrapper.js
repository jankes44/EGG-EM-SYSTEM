import React, { Component } from "react";
import _ from "lodash";
import OverwatchFloorplan from "components/Test/OverwatchFloorplan";
import jwt_decode from "jwt-decode";
import axios from "axios";

export default class LiveFloorplanWrapper extends Component {
  lightsInterval = 0;
  state = {
    lights: [],
  };

  callLightsFloorplans = () => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded.id;

    axios
      //route to lights of group id = this.state.rowId
      .get(global.BASE_URL + "/api/lights/" + user, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.setState({
          lights: response.data.filter((light) => {
            if (light.buildings_id === this.props.clickedBuilding) {
              return light;
            } else return null;
          }),
        });
      });
  };

  componentDidMount() {
    this.callLightsFloorplans();
    this.lightsInterval = setInterval(() => {
      this.callLightsFloorplans();
    }, 20000);
  }

  componentWillUnmount() {
    clearInterval(this.lightsInterval);
  }

  addComment = (id, comment) => {
    this.setState((prevState) => ({
      lights: prevState.lights.map((obj) =>
        obj.id === id ? Object.assign(obj, { comment: comment }) : obj
      ),
    }));

    axios
      //route to lights of group id = this.state.rowId
      .post(global.BASE_URL + "/api/lights/edit/" + id, ["comment", comment], {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        console.log(response);
      });
  };

  render() {
    let devicesGrouped = _.groupBy(this.state.lights, "levels_id");
    return (
      <div>
        {_.map(devicesGrouped, (subArr, i) => {
          return (
            <OverwatchFloorplan
              key={i}
              liveDevices={subArr}
              addComment={this.addComment}
            />
          ); //map those devices and return LiveFloorPlan component which will display floorplans
        })}
      </div>
    );
  }
}
