import React from "react";
import { Icon, Fab, Tooltip } from "@material-ui/core";

export default function NewBuilding() {
  return (
    <div>
      <Tooltip title="Add new devices" aria-label="add devices">
        <Fab color="primary">
          <Icon>add</Icon>
          <Icon style={{ fontSize: "1.5em" }}>emoji_objects</Icon>
        </Fab>
      </Tooltip>
    </div>
  );
}
