import React from "react";

export default function EditBuilding(props) {
  return (
    <div>
      <h4>{props.building.building}</h4>
      <h6>{props.building.address}</h6>
    </div>
  );
}
