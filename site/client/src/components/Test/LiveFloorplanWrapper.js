import React, { Component } from "react";
import _ from "lodash";
import LiveFloorPlan from "components/Test/LiveFloorPlan";

export default class LiveFloorplanWrapper extends Component {
  state = {
    devicesGrouped: [],
  };

  componentDidMount() {
    let devicesGrouped = _.groupBy(this.props.liveDevices, "levels_id"); //group the devices by "levels_id"
    this.setState({ devicesGrouped: devicesGrouped });
  }

  render() {
    let devicesGrouped = _.groupBy(this.props.liveDevices, "levels_id");
    return (
      <div>
        {_.map(devicesGrouped, (subArr, i) => {
          return <LiveFloorPlan key={i} liveDevices={subArr} />; //map those devices and return LiveFloorPlan component which will display floorplans
        })}
      </div>
    );
  }
}
