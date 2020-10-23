import React, { useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";
import { makeStyles } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import Draggable from "react-draggable";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
    width: "100%",
  },
  "@keyframes blinker": {
    "0%": { opacity: "0.2" },
    "20%": { opacity: "0.7" },
    "50%": { opacity: "1" },
    "80%": { opacity: "0.7" },
    "100%": { opacity: "0.2" },
  },
  blink: {
    color: "#3F51B5",
    animationName: "$blinker",
    animationDuration: "2s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
}));

export default function LiveFloorPlan(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openedPopoverId, setOpenedPopoverId] = React.useState(null);
  const [floorplanURL, setFloorplanURL] = React.useState("");
  const [floorplanNotFound, setFloorplanNotFound] = React.useState("");

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
      <Icon
        className={classes.blink}
        style={{
          fontSize: "4em",
          position: "absolute",
          cursor: "pointer",
        }}
      >
        location_on
      </Icon>
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
                case "No connection to bt module":
                  color = "#F50158";
                  break;
                default:
                  color = "grey";
                  break;
              }

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
                    {el.status === "Battery powered/under test" ? (
                      <Icon
                        className={classes.blink}
                        style={{
                          fontSize: "4em",
                          position: "absolute",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => handleClick(e, el.id)}
                        onMouseLeave={handleClose}
                        onTouchStart={(e) => handleClick(e, el.id)}
                        onTouchEnd={handleClose}
                      >
                        location_on
                      </Icon>
                    ) : (
                      <Icon
                        style={{
                          fontSize: "4em",
                          position: "absolute",
                          cursor: "pointer",
                          color: color,
                        }}
                        onMouseEnter={(e) => handleClick(e, el.id)}
                        onMouseLeave={handleClose}
                        onTouchStart={(e) => handleClick(e, el.id)}
                        onTouchEnd={handleClose}
                      >
                        location_on
                      </Icon>
                    )}

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
