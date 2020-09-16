import React, { Component } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "@material-ui/core/Button";
import axios from "axios";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import moment from "moment";
import ScheduleData from "components/Schedule/ScheduleData";
import GroupRenderer from "components/Test/GroupRenderer";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Icon from "@material-ui/core/Icon";
import { IconButton } from "@material-ui/core";
import Popup from "components/Popup/PopupModule";
import "components/Popup/style.css";
import Snackbar from "components/Snackbar/Snackbar";
import { Transition } from "react-transition-group";
import jwt_decode from "jwt-decode";

const butStyle = {
  background:
    "linear-gradient(90deg, rgba(41,214,148,1) 0%, rgba(39,198,210,1) 100%)",
  color: "white",
  width: "auto",
  height: "35px",
  margin: "15px",
  position: "absolute",
  right: 0,
  bottom: 0,
};

const selectStyle = {
  width: "80%",
  height: "auto",
  marginBottom: "20px",
};

const textAlign = {
  textAlign: "left",
};

const duration = 300;

const defaultStyle = {
  transition: `visibility ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`,
  opacity: 0,
  visibility: "hidden",
};

const transitionStyles = {
  entering: { opacity: 1, visibility: "visible" },
  entered: { opacity: 1, visibility: "visible" },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
};

export default class Schedule extends Component {
  state = {
    date: new Date(),
    selectedGroups: [],
    groups: [],
    scheduleData: [],
    scheduleSubData: [],
    levels: [],
    clickedEntry: "",
    isOpenEntry: false,
    showPopup: false,
    showScheduler: false,
    showSnackBar: false,
    showSnackBarCancel: false,
    disabled: true,
    active: false,
  };

  togglePopup = () => {
    this.setState({
      showPopup: !this.state.showPopup,
    });
  };

  toggleScheduler = () => {
    this.setState({
      active: !this.state.active,
    });
  };

  openEntry = (value) => {
    this.setState({
      clickedEntry: value,
      isOpenEntry: !this.state.isOpenEntry,
      showPopup: !this.state.showPopup,
    });
  };

  retrieveData = (endpoint, stateValue) => {
    axios
      .get(global.BASE_URL + "/api/" + endpoint, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.setState({
          [stateValue]: response.data,
        });
      });
  };

  retrieveDataUid = (endpoint, stateValue) => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded.id;

    axios
      .get(global.BASE_URL + "/api/" + endpoint + user, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.setState({
          [stateValue]: response.data,
        });
      });
  };

  refreshData = () => {
    this.retrieveDataUid("schedule/schgrplvl/", "scheduleData");
    this.retrieveDataUid("schedule/schgroups/", "scheduleSubData");
  };

  componentDidMount() {
    this.retrieveDataUid("groups/groupslevel/", "groups");
    this.retrieveDataUid("schedule/schgrplvl/", "scheduleData");
    this.retrieveDataUid("schedule/schgroups/", "scheduleSubData");
    this.retrieveData("levels", "levels");
  }

  onChange = (date) => {
    this.setState({ date: date }, () => {
      if (
        this.state.date > new Date() &&
        this.state.selectedGroups.length > 0
      ) {
        this.setState({ disabled: false });
      } else this.setState({ disabled: true });
    });
  };

  refreshSchedule = () => {
    axios({
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/mqtt/scheduleentry",
    });
  };

  sendEntry = () => {
    if (
      window.confirm(
        `Schedule a test on locations selected - time: ${moment(
          this.state.date
        ).format("k:mm:ss DD-MM-YYYY")}`
      )
    ) {
      axios(
        {
          method: "post",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
          url: global.BASE_URL + "/api/schedule",
          data: {
            date: moment(this.state.date).format("YYYY-MM-DDTk:mm:ss"),
            data: this.state.selectedGroups,
          },
        },
        this.refreshSchedule(),
        this.setState({ showSnackBar: true }),
        setTimeout(() => {
          this.refreshData();
        }, 1000)
      );
    } else this.setState({ showSnackBarCancel: true });
  };

  handleSelect = (event) => {
    this.setState(
      {
        selectedGroups: event.target.value,
      },
      () => {
        if (
          this.state.selectedGroups.length > 0 &&
          this.state.date > new Date()
        ) {
          this.setState({ disabled: false });
        } else {
          this.setState({ disabled: true });
        }
      }
    );
  };

  closeSnackbar = (stateObject, setStateObject, time) => {
    if (stateObject === true) {
      setTimeout(() => {
        this.setState({ [setStateObject]: !stateObject });
      }, time);
    }
  };

  handleCancel = (id) => {
    if (window.confirm(`Cancel job ${id}?`)) {
      axios(
        {
          method: "post",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
          url: global.BASE_URL + "/mqtt/canceljob/" + id,
        },
        setTimeout(() => {}, 1000)
      ).then((response) => {
        if (response.status === 200) {
          this.retrieveDataUid("schedule/schgrplvl/", "scheduleData");
          this.setState({ showSnackBarCancel: true });
        } else this.setState({ showSnackbarFailed: true });
      });
    }
  };

  handleClick = () => {
    this.setState({ active: !this.state.active });
  };

  handleDeleteSelected = (value) => {
    this.setState({
      selectedGroups: this.state.selectedGroups.filter((group) => {
        if (group !== value) {
          return group;
        } else return null;
      }),
    });
  };

  clearSelect = () => {
    this.setState({
      selectedGroups: [],
      disabled: true,
    });
  };

  render() {
    this.closeSnackbar(this.state.showSnackBar, "showSnackBar", 10000);
    this.closeSnackbar(
      this.state.showSnackBarCancel,
      "showSnackBarCancel",
      5000
    );
    this.closeSnackbar(
      this.state.showSnackbarFailed,
      "showSnackbarFailed",
      6000
    );

    return (
      <div>
        <Snackbar
          message={"Cancelled"}
          close
          color="warning"
          place={"bl"}
          open={this.state.showSnackBarCancel}
          closeNotification={() => this.setState({ showSnackBarCancel: false })}
        />
        <Snackbar
          message={"Server fail. Contact administrator."}
          close
          color="danger"
          place={"bl"}
          open={this.state.showSnackbarFailed}
          closeNotification={() => this.setState({ showSnackbarFailed: false })}
        />
        <GridContainer style={textAlign}>
          <Transition in={this.state.active} timeout={300}>
            {(state) => (
              <div
                className="popup"
                style={{ ...defaultStyle, ...transitionStyles[state] }}
              >
                <div
                  className="popupInnerBg"
                  style={{ ...defaultStyle, ...transitionStyles[state] }}
                >
                  <div
                    className="popupInner2"
                    style={{ ...defaultStyle, ...transitionStyles[state] }}
                  >
                    <GridContainer>
                      <GridItem xs={6}>
                        <InputLabel>Set date and time</InputLabel>
                        <DatePicker
                          selected={this.state.date}
                          onChange={(date) => this.onChange(date)}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                        />
                        {this.state.date < new Date() ? (
                          <p>Wrong time</p>
                        ) : null}
                      </GridItem>
                      <GridItem xs={6}>
                        <InputLabel>Select locations</InputLabel>

                        <Select
                          style={selectStyle}
                          onChange={this.handleSelect}
                          value={this.state.selectedGroups}
                          multiple
                        >
                          {this.state.groups.map((item, index) => (
                            <MenuItem key={index} value={item.id}>
                              {item.level} level - {item.group_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem>
                        {this.state.selectedGroups.length ? (
                          <div>
                            <h5 style={{ color: "grey" }}>
                              Locations selected
                            </h5>
                            <GroupRenderer
                              selected={this.state.selectedGroups}
                              groups={this.state.groups}
                              textColor={"black"}
                              bgColour={"whitesmoke"}
                              handleDeleteSelected={this.handleDeleteSelected}
                              clearSelect={this.clearSelect}
                            />
                          </div>
                        ) : (
                          <p>No locations selected</p>
                        )}
                      </GridItem>
                    </GridContainer>
                    <div>
                      <Button
                        style={butStyle}
                        variant="contained"
                        onClick={this.sendEntry}
                        disabled={this.state.disabled} //TODO
                      >
                        Add
                      </Button>
                    </div>

                    <div className="buttonContainer">
                      <IconButton
                        color="secondary"
                        onClick={this.toggleScheduler}
                      >
                        <Icon>cancel</Icon>
                      </IconButton>
                      <Snackbar
                        message={`Test scheduled for ${moment(
                          this.state.date
                        ).format("k:mm:ss DD-MM-YYYY")}`}
                        close
                        color="success"
                        place={"bl"}
                        open={this.state.showSnackBar}
                        closeNotification={() =>
                          this.setState({ showSnackBar: false })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Transition>
        </GridContainer>
        <GridContainer
          justify="center"
          style={{
            minHeight: "200px",
          }}
        >
          <ScheduleData
            data={this.state.scheduleData}
            subData={this.state.scheduleSubData}
            openEntry={this.openEntry}
            clickedEntry={this.state.clickedEntry}
            isOpenEntry={this.state.isOpenEntry}
            handleCancel={this.handleCancel}
          />

          {this.state.showPopup ? (
            <Popup
              data={this.state.scheduleSubData}
              clicked={this.state.clickedEntry}
              text='Click "Close Button" to hide popup'
              closePopup={this.openEntry.bind(this)}
            />
          ) : null}
        </GridContainer>
        <IconButton color="primary" onClick={this.toggleScheduler}>
          <Icon style={{ fontSize: "1.5em" }}>add_circle_outline</Icon>
        </IconButton>
      </div>
    );
  }
}
