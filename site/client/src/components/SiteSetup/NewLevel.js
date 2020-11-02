import React from "react";
import { Icon, Fab, Tooltip } from "@material-ui/core";

export default function NewBuilding(props) {
  return (
    <div>
      <Tooltip title="Add a level" aria-label="add level">
        <Fab
          color="primary"
          onClick={() =>
            props.handleNewLevel(props.building, props.clickedSite, props.data)
          }
        >
          +level
        </Fab>
      </Tooltip>
    </div>
  );
}
