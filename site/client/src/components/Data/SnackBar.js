import React from "react";
//core components
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import AddAlert from "@material-ui/icons/NotificationsNone";

export default function SnackBar(props) {
  return (
    <div>
      <br />
      <SnackbarContent message={props.message} color="info" icon={AddAlert} />
    </div>
  );
}
