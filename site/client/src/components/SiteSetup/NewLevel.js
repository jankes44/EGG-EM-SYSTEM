import React from "react";
import { Icon, Fab, Tooltip } from "@material-ui/core";

export default function NewBuilding() {
  return (
    <div>
      <Tooltip title="Add a level" aria-label="add level">
        <Fab color="primary">+level</Fab>
      </Tooltip>
    </div>
  );
}
