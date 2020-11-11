import React, { useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import Draggable from "react-draggable";
import axios from "axios";
import UnassignedSensors from "components/LiveEmStatus/UnassignedSensors";
import jwt_decode from "jwt-decode";
import {
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
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
  card: {
    float: "left",
    width: "100%",
    maxHeight: "60px",
    margin: "auto",
    transition: "0.5s",
    padding: "5px",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
    backgroundColor: "rgba(161,161,161,0.2)",
    color: "#464646",
  },
  heading: {
    float: "left",
    paddingLeft: "5px",
    paddingTop: "4px",
    textAlign: "center",
    margin: "auto",
    backgroundColor: "#3452B4",
    borderRadius: "100px",
    width: "50px",
    height: "50px",
    color: "white",
    marginRight: "5px",
  },
  changeButton: {
    display: "inline-block",
    margin: "5px",
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
  const [devices, setDevices] = React.useState("");
  const [activeDrags, setActiveDrags] = React.useState(0);
  const [success, setSuccess] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState();

  const openContextMenu = (event, deviceId) => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    if (decoded.access >= 99) {
      setOpenedContextMenu(deviceId);
      console.log(deviceId);
    }
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
      liveDevices_.find((el) => {
        return el.id === deviceId;
      })
    );
    const device = liveDevices_.find((el) => {
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
      props.refreshData();
      console.log(res);
    });
  };

  useEffect(() => {
    const { devices } = props;
    setDevices(devices);
    axios
      .get(global.BASE_URL + "/api/levels/floorplan/" + props.clickedLevel, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
        responseType: "blob",
      })
      .catch((err) => {
        console.log(err);
        setFloorplanNotFound("No floorplan assigned.");
      })
      .then((response) => {
        if (response) setFloorplanURL(URL.createObjectURL(response.data));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.devices]);

  const handleSavePositions = () => {
    axios({
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/sensors/edit-position",
      data: { devices: devices },
    }).then((res) => {
      console.log(res);
      if (res.status === 200) {
        setSuccess(true);
      }
    });
  };

  const handleDrag = (e, ui, index, id) => {
    let { liveDevices } = props;
    console.log(liveDevices);
    liveDevices[index].fp_coordinates_bot =
      liveDevices[index].fp_coordinates_bot + ui.deltaY;
    liveDevices[index].fp_coordinates_left =
      liveDevices[index].fp_coordinates_left + ui.deltaX;
    setDevices(liveDevices);
  };

  const onStart = () => {
    setActiveDrags(activeDrags + 1);
  };

  const onStop = () => {
    setActiveDrags(activeDrags - 1);
  };

  const uploadFP = (event) => {
    const selectedFile = event.target.files[0];
    var idxDot = selectedFile.name.lastIndexOf(".") + 1;
    var extFile = selectedFile.name
      .substr(idxDot, selectedFile.name.length)
      .toLowerCase();
    // eslint-disable-next-line
    if (extFile == "jpg" || extFile == "jpeg") {
      //do whatever want to do

      setSelectedFile(event.target.files[0]);

      const data = new FormData();
      data.append("level", props.clickedLevel);
      data.append("file", event.target.files[0]);

      axios
        .post(global.BASE_URL + "/api/levels/testUpload", data, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
          responseType: "blob",
        })
        .then((response) => {
          console.log(URL.createObjectURL(response.data));
          setFloorplanURL(URL.createObjectURL(response.data));
        });
    } else {
      alert("Only jpg/jpeg files are allowed");
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const dragHandlers = { onStart: onStart, onStop: onStop };

  const liveDevices_ = props.liveDevices;

  return (
    <div>
      <div className={classes.card}>
        <Typography variant="h4" style={{ marginTop: "5px" }}>
          Sensors: {liveDevices_.length > 1 ? liveDevices_.length : 0}
          <p style={{ float: "right" }}></p>
        </Typography>
      </div>
      <div
        style={{
          overflowX: "scroll",
          width: "100%",
          height: "90vh",
          border: "1pt solid black",
        }}
      >
        <div
          // src={this.state.objectURL}
          style={{
            height: "700px",
            width: "1000px",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundImage: `url(${floorplanURL})`,
          }}
          alt="Third Level"
        >
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            {liveDevices_.length > 0 ? (
              !floorplanNotFound ? (
                <div></div>
              ) : (
                <div>
                  <Typography variant="h6" gutterBottom>
                    Upload (only .jpg file extension)
                  </Typography>
                  <input
                    type="file"
                    accept=".jpg"
                    onChange={uploadFP}
                    name="upload"
                  />
                </div>
              )
            ) : (
              <Typography variant="h4" gutterBottom>
                No devices{" "}
              </Typography>
            )}
            {liveDevices_.length > 0 && !floorplanNotFound
              ? liveDevices_.map((el, index) => {
                  return (
                    <Draggable
                      key={el.id}
                      position={{
                        x: el.fp_coordinates_left,
                        y: el.fp_coordinates_bot,
                      }}
                      onDrag={(e, ui) => handleDrag(e, ui, index, el.id)}
                      {...dragHandlers}
                      onStart={onStart}
                      onStop={onStop}
                      grid={[5, 5]}
                      bounds={"parent"}
                    >
                      <div
                        style={{
                          width: "0px",
                          height: "0px",
                          position: "relative",
                        }}
                      >
                        <Icon
                          color="primary"
                          style={{
                            fontSize: "4em",
                            position: "absolute",
                            cursor: "move",
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

                        {activeDrags < 1 ? (
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
                          </Popover>
                        ) : null}
                      </div>
                    </Draggable>
                  );
                })
              : null}
          </div>
        </div>
      </div>
      <Button color="primary" onClick={handleSavePositions}>
        save device positions
      </Button>
      {success ? <h5>Device positions saved.</h5> : null}

      <UnassignedSensors
        clickedBuilding={props.clickedBuilding}
        clickedLevel={props.clickedLevel}
        clickedGroup={props.clickedGroup}
        assignSensor={props.assignSensor}
      />
    </div>
  );
}
