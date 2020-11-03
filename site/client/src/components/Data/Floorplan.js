import React, { Component } from "react";
import axios from "axios";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import Draggable from "react-draggable";
import { withStyles } from "@material-ui/core";
import Popover from "@material-ui/core/Popover";

const styles = {
  typography: {
    padding: "15px",
    width: "100%",
  },
};

class Floorplan extends Component {
  state = {
    selectedFile: null,
    objectURL: "",
    activeDrags: 0,
    id: null,
    devices: [],
    anchorEl: null,
    openedPopoverId: null,
    success: false,
    deltaPosition: {
      x: 0,
      y: 0,
    },
    controlledPosition: {
      x: -400,
      y: 200,
    },
  };

  handleDrag = (e, ui, index, id) => {
    let { devices } = this.props;
    devices[index].fp_coordinates_bot =
      devices[index].fp_coordinates_bot + ui.deltaY;
    devices[index].fp_coordinates_left =
      devices[index].fp_coordinates_left + ui.deltaX;
    this.setState({
      devices: devices,
      test: id,
    });
  };

  onStart = () => {
    this.setState({ activeDrags: this.state.activeDrags + 1 });
  };

  onStop = () => {
    this.setState({ activeDrags: this.state.activeDrags - 1 });
  };

  // For controlled component
  adjustXPos = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = this.state.controlledPosition;
    this.setState({ controlledPosition: { x: x - 10, y } });
  };

  adjustYPos = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { controlledPosition } = this.state;
    const { x, y } = controlledPosition;
    this.setState({ controlledPosition: { x, y: y - 10 } });
  };

  onControlledDrag = (e, position) => {
    const { x, y } = position;
    this.setState({ controlledPosition: { x, y } });
  };

  onControlledDragStop = (e, position) => {
    this.onControlledDrag(e, position);
    this.onStop();
  };

  onChangeHandler = (event) => {
    const selectedFile = event.target.files[0];
    var idxDot = selectedFile.name.lastIndexOf(".") + 1;
    var extFile = selectedFile.name
      .substr(idxDot, selectedFile.name.length)
      .toLowerCase();
    // eslint-disable-next-line
    if (extFile == "jpg" || extFile == "jpeg") {
      //do whatever want to do

      this.setState(
        {
          selectedFile: event.target.files[0],
          loaded: 0,
        },
        () => {
          const data = new FormData();
          data.append("level", this.props.clickedLvl);
          data.append("file", this.state.selectedFile);

          axios
            .post(global.BASE_URL + "/api/levels/testUpload", data, {
              headers: {
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: "Bearer " + localStorage.usertoken,
              },
              responseType: "blob",
            })
            .then((response) => {
              this.setState({
                objectURL: URL.createObjectURL(response.data),
              });
            });
        }
      );
    } else {
      alert("Only jpg/jpeg files are allowed");
    }
  };

  handleSavePositions = () => {
    axios({
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/lights/edit/many",
      data: { devices: this.state.devices },
    }).then((res) => {
      console.log(res);
    });
  };

  componentDidMount() {
    axios
      .get(global.BASE_URL + "/api/levels/floorplan/" + this.props.clickedLvl, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
        responseType: "blob",
      })
      .catch((err) => {
        throw err;
      })
      .then((response) => {
        this.setState({
          objectURL: URL.createObjectURL(response.data),
        });
      });
    const { devices } = this.props;
    this.setState({ devices: devices });
  }

  handleClick = (event, deviceId) => {
    this.setState({ anchorEl: event.currentTarget, openedPopoverId: deviceId });
  };

  handleClose = () => {
    this.setState({ anchorEl: null, openedPopoverId: null });
  };

  render() {
    const open = Boolean(this.state.anchorEl);
    const id = open ? "simple-popover" : undefined;
    const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
    const { classes } = this.props;
    let devicesWhenUpdate = this.props.devices;

    return (
      <div>
        {this.state.test}
        {this.state.objectURL ? (
          <div>
            <div style={{ overflowX: "scroll", maxWidth: "65vw" }}>
              <div
                // src={this.state.objectURL}
                style={{
                  height: "550px",
                  width: "1200px",
                  border: "1pt solid black",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                  backgroundImage: `url(${this.state.objectURL})`,
                }}
                alt="Third Level"
              >
                {devicesWhenUpdate.map((el, index) => {
                  let color;
                  if (el.status === "OK") {
                    color = "primary";
                  } else color = "secondary";

                  return (
                    <Draggable
                      key={el.id}
                      grid={[5, 5]}
                      bounds={"parent"}
                      position={{
                        x: el.fp_coordinates_left,
                        y: el.fp_coordinates_bot,
                      }}
                      onDrag={(e, ui) => this.handleDrag(e, ui, index, el.id)}
                      {...dragHandlers}
                    >
                      <div
                        style={{
                          width: "0px",
                          height: "0px",
                          position: "relative",
                        }}
                      >
                        <Icon
                          color={color}
                          style={{
                            fontSize: "4em",
                            position: "absolute",
                            cursor: "move",
                          }}
                          onMouseEnter={(e) => this.handleClick(e, el.id)}
                          onMouseLeave={this.handleClose}
                        >
                          location_on
                        </Icon>
                        <Popover
                          id={id}
                          open={this.state.openedPopoverId === el.id}
                          anchorEl={this.state.anchorEl}
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
                      </div>
                    </Draggable>
                  );
                })}
              </div>
            </div>
            {this.state.success ? <h5>Saved successfuly</h5> : null}

            <Button color="primary" onClick={this.handleSavePositions}>
              Save device positions
            </Button>
            <Button
              color="primary"
              onClick={() => {
                if (window.confirm("Are you sure?"))
                  this.setState({ objectURL: "" });
              }}
            >
              Change floorplan
            </Button>
          </div>
        ) : (
          <div>
            <Typography variant="h6" gutterBottom>
              Upload (only .jpg file extension)
            </Typography>
            <input
              type="file"
              name="file"
              accept=".jpg"
              onChange={this.onChangeHandler}
            />
          </div>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(Floorplan);
