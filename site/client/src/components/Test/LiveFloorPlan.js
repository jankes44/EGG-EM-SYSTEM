import React, { useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";
import { makeStyles } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import moment from "moment";
import Draggable from "react-draggable";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
    width: "100%",
  },
}));

export default function LiveFloorPlan(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openedPopoverId, setOpenedPopoverId] = React.useState(null);
  const [floorplanURL, setFloorplanURL] = React.useState("");

  const handleClick = (event, deviceId) => {
    setAnchorEl(event.currentTarget);
    setOpenedPopoverId(deviceId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenedPopoverId(null);
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
      })
      .then((response) => {
        setFloorplanURL(URL.createObjectURL(response.data));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  return (
    <div style={{ overflowX: "scroll", width: "75vw" }}>
      <Typography variant="h4" gutterBottom>
        {props.liveDevices[0].level} level
      </Typography>
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
        {props.liveDevices.length > 0
          ? props.liveDevices.map((el) => {
              var color;

              if (el.powercut === 1 || el.powercut === 2) {
                color = "primary";
              }
              if (el.powercut === 3) {
                color = "secondary";
              }

              var duration = moment.duration(el.duration);
              var hr = duration.hours();
              var min = duration.minutes();
              var sec = duration.seconds();

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
                    <Icon
                      color={color}
                      style={{
                        fontSize: "4em",
                        position: "absolute",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => handleClick(e, el.id)}
                      onMouseLeave={handleClose}
                    >
                      location_on
                    </Icon>
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
                        {el.powercut === 0 ? (
                          <Typography className={classes.typography}>
                            Awaiting start
                          </Typography>
                        ) : null}
                        {el.powercut === 1 && el.duration !== 0 ? (
                          <Typography className={classes.typography}>
                            In progress
                          </Typography>
                        ) : null}
                        {el.powercut === 3 ? (
                          <Typography className={classes.typography}>
                            No response
                          </Typography>
                        ) : null}
                      </div>

                      <div>
                        {el.duration === 0 ? (
                          <Typography className={classes.typography}>
                            Finished
                          </Typography>
                        ) : (
                          <Typography className={classes.typography}>
                            Time left: {`${hr}:${min}:${sec}`}
                          </Typography>
                        )}
                      </div>
                    </Popover>
                  </div>
                </Draggable>
              );
            })
          : null}
      </div>
    </div>
  );
}
