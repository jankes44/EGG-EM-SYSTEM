import React from "react";
import "components/Popup/style.css";
import Paper from "@material-ui/core/Paper";
import Chip from "@material-ui/core/Chip";
import { Button } from "@material-ui/core";

// const groupsStyle = {
//   color: "grey",
//   fontWeight: "light",
//   fontSize: "1em",
// };

const rootStyle = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  listStyle: "none",
  padding: 0.5,
  margin: 0,
  width: "350px",
  maxHeight: "300px",
  overflowY: "scroll",
};
const chip = {
  margin: 0.5,
};

const GroupRenderer = (props) => {
  var any = "";
  var array = [];
  props.selected.forEach((element) => {
    any = props.groups.find((x) => x.id === element);
    array.push(any);
  });

  return (
    <div>
      <Paper style={rootStyle}>
        {array.map((data) => {
          return (
            <li key={data.id}>
              <Chip
                color="primary"
                label={`${data.level} - ${data.group_name}`}
                style={chip}
                onClick={() => props.handleDeleteSelected(data.id)}
                onDelete={() => props.handleDeleteSelected(data.id)}
              />
            </li>
          );
        })}
      </Paper>
      {props.selected.length ? (
        <Button onClick={props.clearSelect} color="primary">
          clear
        </Button>
      ) : null}
    </div>
  );
};

export default GroupRenderer;
