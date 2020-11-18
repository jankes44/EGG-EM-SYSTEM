import React, { Component } from "react";
import axios from "axios";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Icon from "@material-ui/core/Icon";
import GroupsTable from "components/Data/GroupsTable.js";
import Button from "@material-ui/core/Button";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardFooter from "components/Card/CardFooter.js";
import IconButton from "@material-ui/core/IconButton";
import { withStyles } from "@material-ui/core/styles";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import Snackbar from "components/Snackbar/Snackbar";
import AddAlert from "@material-ui/icons/AddAlert";
import jwt_decode from "jwt-decode";
import Typography from "@material-ui/core/Typography";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Fab from "@material-ui/core/Fab";
import Floorplan from "components/Data/Floorplan";
import OverwatchFloorplan from "components/Test/OverwatchFloorplanWrapper";
import Modal from "@material-ui/core/Modal";
import TextField from "@material-ui/core/TextField";
import Slider from "@material-ui/core/Slider";
import InputLabel from "@material-ui/core/InputLabel";

// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

// const textWhite = {
//   color: "white",
// };

// const capitalize = {
//   textTransform: "capitalize"
// };

// const textAlign = {
//   textAlign: "center",
// };

const crumbleContainer = {
  textDecoration: "none",
  fontSize: "1.3em",
  color: "grey",
  display: "flex",
  marginTop: "20px",
};

const styles = {
  root: {
    backgroundColor: "transparent",
    boxShadow: "none",
    paddingTop: "0px",
    padding: "20px",
    marginBottom: "0px",
  },
  "@keyframes opacity": {
    "100%": { opacity: 1 },
  },
  modalRoot: {
    background: "rgba(255,255,255,0)",
  },
  buildingStyle: {
    transition: "0.3s",
    "&:hover": {
      transition: "0.3s",
      backgroundColor: "#e8e8e8",
    },
    cursor: "pointer",
    backgroundColor: "white",
  },
  crumbleNavigation: {
    transition: "0.3s",
    "&:hover": {
      transition: "0.3s",
      color: "black",
      textDecoration: "underline",
      cursor: "pointer",
    },
  },
  gwStatus: {
    transition: "0.3s",
    "&:hover": {
      transition: "0.3s",
      color: "black",
      textDecoration: "none",
      cursor: "pointer",
    },
  },
  tableFadeIn: {
    opacity: "0",
    margin: "15px",
    animationName: "$opacity",
    animationDuration: "0.3s",
    animationTimingFunction: "linear",
    animationFillMode: "forwards",
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontWeight: "400",
      lineHeight: "1",
    },
  },
  paper: {
    position: "absolute",
    maxWidth: "485px",
    backgroundColor: "white",
    boxShadow: "5px 5px 3px #333333",
    padding: "20px",
  },
};

let insertCounter = 0;

class groups extends Component {
  state = {
    sites: [],
    clickedSite: null,
    siteName: "",
    buildings: [],
    buildingsFiltered: [],
    clickedBuilding: null,
    isClickedBuilding: false,
    buildingName: "",
    levels: [],
    groups: [],
    groupsFiltered: [],
    lights: [],
    lights: [],
    lastId: null,
    lightCount: null,
    isClickedGroup: false,
    groupName: "",
    isClickedLevel: false,
    levelName: "",
    levels_id: null,
    clickedEdit: "",
    isOpenEdit: false,
    lgt_groups_id: null,
    showPopup: false,
    showInsertPopup: false,
    group_name: "",
    newRows: [],
    clickedGroup: null,
    showSnackBarCancel: false,
    showSnackbarSuccess: false,
    modalOpen: false,
    levelModalOpen: false,
    modalstyle: {},
    newBuildingName: "",
    newLevelCount: 1,
    gwState: "Wait...",
    levelColumns: [
      {
        dataField: "id",
        text: "ID",
        sort: true,
        hidden: true,
      },
      {
        dataField: "level",
        text: "Level",
        sort: true,
        headerStyle: () => {
          return { width: "180px" };
        },
        formatter: (cell) => {
          return "Level " + cell;
        },
      },
      {
        dataField: "devices",
        text: "Devices",
        sort: true,
        editable: false,
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            this.state.levels.forEach((level) => {
              if (level.id === row.id) {
                this.setState({
                  levelName: level.level,
                });
              }
            });
            this.setState(
              {
                isClickedLevel: true,
                levels_id: row.id,
                lgt_groups_id: row.group_id,
                groupsFiltered: this.state.groups.filter((group) => {
                  if (group.levels_id === row.id) {
                    return group;
                  } else return null;
                }),
                lights: this.state.lights.filter((light) => {
                  if (light.levels_id === row.id) {
                    return light;
                  } else {
                    return null;
                  }
                }),
              },
              () => {
                console.log(this.state.lgt_groups_id);
              }
            );
          },
        },
      },
      {
        dataField: "lights_count",
        text: "Devices count",
        sort: true,
        editable: false,
        headerStyle: () => {
          return { width: "100px" };
        },
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            this.state.levels.forEach((level) => {
              if (level.id === row.id) {
                this.setState({
                  levelName: level.level,
                });
              }
            });
            this.setState(
              {
                isClickedLevel: true,
                levels_id: row.id,
                lgt_groups_id: row.group_id,
                groupsFiltered: this.state.groups.filter((group) => {
                  if (group.levels_id === row.id) {
                    return group;
                  } else return null;
                }),
              },
              () => {
                if (this.state.lights.length > 0) {
                  this.setState({
                    lgt_groups_id: this.state.lights[0].lgt_groups_id,
                  });
                }
              }
            );
          },
        },
      },
      {
        dataField: "id",
        text: "",
        editable: false,
        headerStyle: (colum, colIndex) => {
          return { width: "75px", textAlign: "center" };
        },
        formatter: (cellContent, row, rowId, rowIndex, e) => {
          return (
            <IconButton
              color="secondary"
              onClick={(e) => {
                e.stopPropagation();
                this.deleteLevel(row);
              }}
            >
              <Icon style={{ fontSize: "1.2em" }}>delete</Icon>
            </IconButton>
          );
        },
      },
    ],
    groupcolumns: [
      {
        dataField: "id",
        text: "Location ID",
        sort: true,
        hidden: true,
      },
      {
        dataField: "group_name",
        text: "Location",
        sort: true,
        editable: true,
        headerStyle: () => {
          return { width: "180px" };
        },
      },
      {
        dataField: "device",
        text: "Devices",
        sort: true,
        editable: false,
        events: {
          onClick: (e, column, columnIndex, row, rowIndex) => {
            this.state.groupsFiltered.forEach((group) => {
              if (group.id === row.id) {
                this.setState({ groupName: group.group_name });
              }
            });

            this.setState({
              isClickedGroup: true,
              isClickedLevel: false,
              lgt_groups_id: row.id,
            });
          },
        },
      },
      {
        dataField: "id",
        text: "",
        editable: false,
        headerStyle: (colum, colIndex) => {
          return { width: "75px", textAlign: "center" };
        },
        formatter: (cellContent, row, rowId, rowIndex, e) => {
          return (
            <IconButton
              color="secondary"
              onClick={(e) => {
                e.stopPropagation();
                this.deleteGroup(row);
              }}
            >
              <Icon style={{ fontSize: "1.2em" }}>delete</Icon>
            </IconButton>
          );
        },
      },
    ],
  };

  callSites = () => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const usersId = decoded.id;

    axios
      .get(global.BASE_URL + "/api/sites/" + usersId, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        if (response.data.length) {
          this.setState(
            {
              sites: response.data,
              clickedSite: response.data[0].sites_id,
              siteName: response.data[0].name,
            },
            () => {
              this.checkStatus(this.state.sites[0].socket_name);
              this.callBuildings();
            }
          );
        }
      });
  };

  callBuildings = () => {
    axios
      .get(global.BASE_URL + "/api/buildings", {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.callLevels();
        this.setState({
          buildings: response.data,
          buildingsFiltered: response.data.filter((building) => {
            if (building.sites_id === this.state.clickedSite) {
              return building;
            } else return null;
          }),
        });
      });
  };

  callLevels = () => {
    axios
      //route to lights of group id = this.state.rowId
      .get(global.BASE_URL + "/api/levels/", {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.callGroups();
        this.setState(
          {
            levels: response.data,
          },
          () => {
            this.setState({
              levelsFiltered: this.state.levels.filter((level) => {
                if (level.buildings_id === this.state.clickedBuilding) {
                  return level;
                } else return null;
              }),
            });
          }
        );
      });
  };

  callGroups = () => {
    axios
      .get(global.BASE_URL + "/api/groups/", {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.callLights();
        this.setState(
          {
            groups: response.data,
          },
          () => {
            this.setState({
              groupsFiltered: this.state.groups.filter((group) => {
                if (group.levels_id === this.state.levels_id) {
                  return group;
                } else return null;
              }),
            });
          }
        );
      });
  };

  callLights = () => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded.id;

    axios
      //route to lights of group id = this.state.rowId
      .get(global.BASE_URL + "/api/lights/level/" + this.props.levelID, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        if (response.data.some((rows) => rows.last_id)) {
          this.setState({
            lights: [],
            lights: [],
          });
        }

        this.setState({
          lights: response.data,
        });
      });
  };

  componentDidMount() {
    this.callSites();
    this.setState({ modalStyle: this.getModalStyle });
  }

  handleClickBuilding = (clickedBuilding) => {
    this.setState({ isClickedBuilding: true }, () => {
      this.setState({
        buildingName: this.state.buildings.find((x) => x.id === clickedBuilding)
          .building,
        clickedBuilding: clickedBuilding,

        levelsFiltered: this.state.levels.filter((level) => {
          if (level.buildings_id === clickedBuilding) {
            return level;
          } else return null;
        }),
      });
    });
  };

  checkStatus = (socketName) => {
    console.log("checkStatus of", socketName);
    this.setState({ gwState: "Wait..." });
    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/sockets/status",
      data: {
        socket: socketName,
      },
      timeout: 0,
    })
      .then((res) => {
        console.log(res);
        let gwStatus = res.data.message.gwStatus;
        let siteCheck = this.state.sites.find(
          (el) => el.sites_id === this.state.clickedSite
        );

        console.log(siteCheck);
        if (gwStatus.includes("NO RESPONSE"))
          gwStatus = `${gwStatus} - Please contact the administrator`;
        if (siteCheck.socket_name === socketName)
          this.setState({ gwState: gwStatus });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  handleChangeSite = (event, site) => {
    if (this.state.sites.find((x) => x.sites_id === site)) {
      this.checkStatus(
        this.state.sites.find((x) => x.sites_id === site).socket_name
      );
      this.setState({
        siteName: this.state.sites.find((x) => x.sites_id === site).name,
        isClickedBuilding: false,
        isClickedGroup: false,
        isClickedLevel: false,
        levels_id: null,
        clickedSite: site,
        buildingsFiltered: this.state.buildings.filter((building) => {
          if (building.sites_id === site) {
            return building;
          } else return null;
        }),
      });
    }
  };

  openModal = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  levelOpenModal = () => {
    this.setState({ levelModalOpen: true });
  };

  levelCloseModal = () => {
    this.setState({ levelModalOpen: false });
  };

  getModalStyle = () => {
    const top = 50;
    const left = 50;

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  };

  handleCreateBuilding = () => {
    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/buildings/new",
      data: {
        name: this.state.newBuildingName,
        sites_id: this.state.clickedSite,
        levels_count: this.state.newLevelCount,
      },
    })
      .then((response) => {
        console.log(response);
        this.callBuildings();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  handleCreateLevel = () => {
    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/levels",
      data: {
        buildings_id: this.state.clickedBuilding,
      },
    })
      .then((response) => {
        console.log(response);
        this.levelCloseModal();
        this.callSites();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  deleteLevel = (row) => {
    var value = "";
    if (
      window.prompt(
        "Enter name of the level eg.'Sixth' (case sensitive) to delete. ONLY DELETE IF YOU KNOW WHAT YOU ARE DOING",
        value
      ) === row.level
    ) {
      axios
        .delete(global.BASE_URL + "/api/levels/" + row.id, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
        })
        .then((response) => {
          this.callLevels();
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    } else this.setState({ showSnackBarCancel: true });
  };

  deleteGroup = (row) => {
    if (window.confirm("Are you sure?")) {
      axios
        .delete(global.BASE_URL + "/api/groups/" + row.id, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
        })
        .then((response) => {
          this.callGroups();
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  deleteDevice = (rowId) => {
    this.setState({
      newRows: this.state.newRows.filter((x) => {
        return x.id !== rowId;
      }),
    });
    this.setState({
      lights: this.state.lights.filter((device) => {
        return device.id !== rowId;
      }),
    });
    this.setState({
      lights: this.state.lights.filter((device) => {
        return device.id !== rowId;
      }),
    });
  };

  removePeople(e) {
    this.setState({
      people: this.state.people.filter(function(person) {
        return person !== e.target.value;
      }),
    });
  }

  moveHandle = (light) => {
    axios
      .post(
        global.BASE_URL + "/api/lights/move/" + light.id,
        { levels_id: this.state.levels_id },
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
        }
      )
      .then((response) => {
        this.callSites();
        this.setState({ showSnackbarSuccess: true });
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  insertHandle = () => {
    let lightsCopy = this.state.lights;
    let newRows = this.state.newRows;

    insertCounter++;

    axios
      //route to lights of group id = this.state.rowId
      .get(global.BASE_URL + "/api/lights/lastid", {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.setState({ lastId: response.data.last_id }, () => {
          console.log(this.state.lastId);
          lightsCopy.push({
            id: this.state.lastId + insertCounter,
            group_name: this.state.groupName,
            lgt_groups_id: this.state.clickedGroup,
            levels_id: this.state.levels_id,
            node_id: null,
            type: null,
            device_id: null,
          });
          newRows.push({
            id: this.state.lastId + insertCounter,
            group_name: this.state.groupName,
            lgt_groups_id: this.state.lgt_groups_id,
          });
        });

        this.setState({ newRows: newRows });
      });
    this.setState({ lights: lightsCopy });
  };

  clearNewRows = () => {
    this.setState({ newRows: [] });
  };

  clearInsertCounter = () => {
    insertCounter = 0;
  };

  insertGroup = () => {
    axios
      .post(
        global.BASE_URL + "/api/groups/new",
        { levels_id: this.state.levels_id, group_name: "New location" },
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
        }
      )
      .then((response) => {
        console.log(response);
        this.callGroups();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  changeHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  closeSnackbar = (stateObject, setStateObject, time) => {
    if (stateObject === true) {
      setTimeout(() => {
        this.setState({ [setStateObject]: !stateObject });
      }, time);
    }
  };

  render() {
    this.closeSnackbar(
      this.state.showSnackBarCancel,
      "showSnackBarCancel",
      5000
    );
    this.closeSnackbar(
      this.state.showSnackbarSuccess,
      "showSnackbarSuccess",
      5000
    );

    const afterSaveCellLevels = (oldValue, newValue, row, column, done) => {
      const colName = column.dataField;

      if (newValue && newValue !== oldValue) {
        if (
          window.confirm(
            `Are you sure you want to edit this cell with new value of ${newValue}?`
          )
        ) {
          axios({
            //Axios POST request
            method: "post",
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
              Authorization: "Bearer " + localStorage.usertoken,
            },
            url: global.BASE_URL + "/api/levels/edit/" + parseInt(row.id),
            data: {
              colName: colName,
              level: newValue,
            },
          })
            .then((response) => {
              console.log(response);
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          this.setState({ showSnackBarCancel: true });
          this.callLevels();
        }
      } else this.callLevels();
    };

    // const afterSaveCell = (oldValue, newValue, row, column, done) => {
    //   const colName = column.dataField;

    //   if (newValue) {
    //     if (
    //       window.confirm(
    //         `Are you sure you want to edit this cell with new value of ${newValue}?`
    //       )
    //     ) {
    //       axios({
    //         //Axios POST request
    //         method: "post",
    //         headers: {
    //           "Content-Type": "application/json;charset=UTF-8",
    //           Authorization: "Bearer " + localStorage.usertoken,
    //         },
    //         url: global.BASE_URL + "/api/groups/edit/" + parseInt(row.id),
    //         data: {
    //           colName: colName,
    //           newValue: newValue,
    //         },
    //       })
    //         .then((response) => {
    //           this.callLevels();
    //           console.log(response);
    //         })
    //         .catch((error) => {
    //           console.log(error);
    //         });
    //     } else {
    //       this.setState({ showSnackBarCancel: true });
    //       this.callGroups();
    //     }
    //   } else this.callGroups();
    // };

    const { classes } = this.props;

    return (
      <div className={classes.tableFadeIn}>
        <GroupsTable
          lights={this.state.lights}
          callLights={this.callLights}
          callGroups={this.callGroups}
          callSites={this.callSites}
          selectOptions={this.state.groups}
          deleteDevice={this.deleteDevice}
          newRows={this.state.newRows}
          clearNewRows={this.clearNewRows}
          clearInsertCounter={this.clearInsertCounter}
        />
        <Button
          color="primary"
          onClick={() => this.setState({ showInsertPopup: true })}
        >
          Move Existing Device
        </Button>
        <Button color="primary" onClick={this.insertHandle}>
          New device
        </Button>
      </div>
    );
  }
}

export default withStyles(styles)(groups);
