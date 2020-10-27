import React, { useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import Draggable from "react-draggable";
import axios from "axios";
import {
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Icon,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
    width: "100%",
  },
  "@keyframes blinker": {
    "0%": { opacity: "0.2" },
    "20%": { opacity: "0.5" },
    "50%": { opacity: "1" },
    "80%": { opacity: "0.5" },
    "100%": { opacity: "0.2" },
  },
  blink: {
    color: "#3F51B5",
    animationName: "$blinker",
    animationDuration: "1.5s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "40vw",
  },
}));

export default function LiveFloorPlan(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openedPopoverId, setOpenedPopoverId] = React.useState(null);
  const [openedContextMenu, setOpenedContextMenu] = React.useState(false);
  const [floorplanURL, setFloorplanURL] = React.useState("");
  const [floorplanNotFound, setFloorplanNotFound] = React.useState("");
  const [comment, setComment] = React.useState("");

  const openContextMenu = (event, deviceId) => {
    setOpenedContextMenu(deviceId);
    console.log(deviceId);
  };

  const handleCloseContextMenu = () => {
    setOpenedContextMenu(null);
  };

  const handleHover = (event, deviceId) => {
    setAnchorEl(event.currentTarget);
    setOpenedPopoverId(deviceId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenedPopoverId(null);
  };

  const onChange = (e) => {
    setComment(e.target.value);
  };

  const checkConnectivity = (deviceId) => {
    console.log(
      props.liveDevices.find((el) => {
        return el.id === deviceId;
      })
    );
    const device = props.liveDevices.find((el) => {
      return el.id === deviceId;
    });
    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/mqtt/dev/checkconnectivity",
      data: {
        topic: "LIVESPCOM",
        device: device,
      },
      timeout: 0,
    }).then((res) => {
      console.log(res);
    });
  };

  useEffect(() => {
    axios
      .get(
        global.BASE_URL +
          "/api/levels/floorplan/" +
          props.liveDevices[0].levels_id,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
          responseType: "blob",
        }
      )
      .catch((err) => {
        console.log(err);
        setFloorplanNotFound(
          "No floorplan assigned. You can assign it by navigating to that level in a table on the top of the page"
        );
      })
      .then((response) => {
        if (response) setFloorplanURL(URL.createObjectURL(response.data));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {props.liveDevices[0].level} level
      </Typography>
      <div style={{ overflowX: "scroll", width: "100%" }}>
        <div
          // src={this.state.objectURL}
          style={{
            height: "550px",
            width: "1200px",
            border: "1pt solid black",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundImage: `url(${floorplanURL})`,
          }}
          alt="Third Level"
        >
          {props.liveDevices.length > 0 && !floorplanNotFound ? (
            props.liveDevices.map((el) => {
              let color;

              switch (el.status) {
                case "OK":
                  color = "#4fa328";
                  break;
                case "No connection to driver":
                  color = "orange";
                  break;
                case "Battery powered/under test":
                  color = "blue";
                  setInterval(() => {
                    color = "grey";
                  }, 1000);
                  setInterval(() => {
                    color = "blue";
                  }, 2000);
                  break;
                case "Weak connection to Mesh":
                  color = "#F50158";
                  break;
                case "Battery disconnected":
                  color = "purple";
                  break;
                default:
                  color = "grey";
                  break;
              }

              let blink =
                el.status === "Battery powered/under test"
                  ? classes.blink
                  : null;

              return (
                <Draggable
                  key={el.id}
                  position={{
                    x: el.fp_coordinates_left,
                    y: el.fp_coordinates_bot,
                  }}
                  onStart={() => false}
                >
                  <div
                    style={{
                      width: "0px",
                      height: "0px",
                      position: "relative",
                    }}
                  >
                    {/* {el.status === "Battery powered/under test" ? (
                      <Icon
                        className={blink}
                        style={{
                          fontSize: "4em",
                          position: "absolute",
                          cursor: "pointer",
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          //add closing functionality
                          openContextMenu(e, el.id);
                        }}
                        onClick={(e) => handleHover(e, el.id)}
                        onMouseEnter={(e) => handleHover(e, el.id)}
                        onMouseLeave={handleClose}
                        onTouchStart={(e) => handleHover(e, el.id)}
                        onTouchEnd={handleClose}
                      >
                        location_on
                      </Icon>
                    ) : ( */}
                    <Icon
                      className={blink}
                      style={{
                        fontSize: "4em",
                        position: "absolute",
                        cursor: "pointer",
                        color: color,
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        //add closing functionality
                        openContextMenu(e, el.id);
                      }}
                      onClick={(e) => openContextMenu(e, el.id)}
                      onMouseEnter={(e) => handleHover(e, el.id)}
                      onMouseLeave={handleClose}
                      onTouchStart={(e) => handleHover(e, el.id)}
                      onTouchEnd={handleClose}
                    >
                      location_on
                    </Icon>
                    {/* )} */}

                    <Dialog
                      open={openedContextMenu === el.id}
                      onClose={handleCloseContextMenu}
                      aria-labelledby="form-dialog-title"
                    >
                      <DialogTitle id="form-dialog-title">
                        {`${el.device_id} - ${el.type} - ${el.node_id}`}
                      </DialogTitle>
                      <DialogContent>
                        <DialogContentText>
                          Status: {el.status}
                        </DialogContentText>
                        <DialogContentText>
                          {el.comment ? (
                            <span>
                              Comment: <i>{el.comment}</i>
                            </span>
                          ) : (
                            <i>No comment</i>
                          )}
                        </DialogContentText>
                        <TextField
                          className={classes.textField}
                          autoFocus
                          margin="dense"
                          id="name"
                          label="Add comment"
                          type="text"
                          onChange={onChange}
                        />
                        <IconButton
                          onClick={() => props.addComment(el.id, comment)}
                          color="primary"
                        >
                          <Icon>add_comment</Icon>
                        </IconButton>
                        <IconButton
                          onClick={() => props.addComment(el.id, "")}
                          color="secondary"
                        >
                          <Icon>delete</Icon>
                        </IconButton>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => checkConnectivity(el.id)}>
                          test connectivity
                        </Button>
                        <Button
                          onClick={handleCloseContextMenu}
                          color="primary"
                        >
                          close
                        </Button>
                      </DialogActions>
                    </Dialog>

                    <Popover
                      id={id}
                      open={openedPopoverId === el.id}
                      anchorEl={anchorEl}
                      style={{ pointerEvents: "none" }} //important
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "center",
                      }}
                    >
                      <div>
                        <Typography className={classes.typography}>
                          {`${el.device_id} - ${el.type} - ${el.node_id}`}
                        </Typography>
                      </div>
                      <div>
                        <Typography className={classes.typography}>
                          Status: {el.status}
                        </Typography>
                      </div>
                      <div style={{ maxWidth: "25vw" }}>
                        <Typography className={classes.typography}>
                          {el.comment ? (
                            <span>
                              Comment: <i>{el.comment}</i>
                            </span>
                          ) : null}
                        </Typography>
                      </div>
                    </Popover>
                  </div>
                </Draggable>
              );
            })
          ) : (
            <h5>{floorplanNotFound}</h5>
          )}
        </div>
      </div>
    </div>
  );
}
