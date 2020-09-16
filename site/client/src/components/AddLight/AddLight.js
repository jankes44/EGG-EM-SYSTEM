import Button from "@material-ui/core/Button";
import EditIcon from "@material-ui/icons/Edit";
import EditLight from "components/Edit/EditLight.js";
import React, { Component } from "react";
import Popup from "reactjs-popup";

const butStyle = {
  marginTop: "5px"
};

class AddLight extends Component {

  render() {
    return (
      <div>
        <Popup
          trigger={
            <Button
              style={butStyle}
              variant="outlined"
              color="secondary"
              type="button"
            >
              <EditIcon />
            </Button>
          }
          position="bottom left"
        >
          <EditLight />
        </Popup>
      </div>
    );
  }
}

export default AddLight;
