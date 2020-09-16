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
// import Maps from "components/Maps/Maps";

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
    lightsFiltered: [],
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
          return cell + " level";
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
                lightsFiltered: this.state.lights.filter((light) => {
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
                lightsFiltered: this.state.lights.filter((light) => {
                  if (light.levels_id === row.id) {
                    return light;
                  } else {
                    return null;
                  }
                }),
              },
              () => {
                if (this.state.lightsFiltered.length > 0) {
                  this.setState({
                    lgt_groups_id: this.state.lightsFiltered[0].lgt_groups_id,
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
              lightsFiltered: this.state.lights.filter((light) => {
                if (light.lgt_groups_id === row.id) {
                  return light;
                } else return null;
              }),
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
      .get(global.BASE_URL + "/api/lights/" + user, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        if (response.data.some((rows) => rows.last_id)) {
          this.setState({
            lights: [],
            lightsFiltered: [],
          });
        }

        this.setState(
          {
            lights: response.data,
          },
          () => {
            this.setState({
              lightsFiltered: this.state.lights.filter((light) => {
                if (light.lgt_groups_id === this.state.lgt_groups_id) {
                  return light;
                } else return null;
              }),
            });
          }
        );
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
        lightsFiltered: this.state.lights.filter((light) => {
          if (light.buildings_id === clickedBuilding) {
            return light;
          } else return null;
        }),
      });
    });
  };

  handleChangeSite = (event, site) => {
    if (this.state.sites.find((x) => x.sites_id === site)) {
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
        lightsFiltered: this.state.lights.filter((light) => {
          if (light.sites_id === site) {
            return light;
          } else {
            return null;
          }
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
      lightsFiltered: this.state.lightsFiltered.filter((device) => {
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
        { lgt_groups_id: this.state.lgt_groups_id },
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
        this.setState({ lastId: response.data[0].last_id }, () => {
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
        this.setState({
          lightsFiltered: this.state.lights.filter((light) => {
            if (light.levels_id === this.state.levels_id) {
              return light;
            } else return null;
          }),
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
      <div>
        <CardBody className={classes.root}>
          {/* BACK BUTTONS AND TABS FOR SITES*/}
          <GridContainer justify="center">
            <Typography style={{ marginBottom: "20px" }} variant="h4">
              Your Sites
            </Typography>
          </GridContainer>

          <GridContainer justify="space-around">
            <Snackbar
              message={"Cancelled action"}
              close
              icon={AddAlert}
              color="warning"
              place={"br"}
              open={this.state.showSnackBarCancel}
              closeNotification={() =>
                this.setState({ showSnackBarCancel: false })
              }
            />
            <Snackbar
              message={"Moved successfully"}
              close
              icon={AddAlert}
              color="success"
              place={"br"}
              open={this.state.showSnackbarSuccess}
              closeNotification={() =>
                this.setState({ showSnackbarSuccess: false })
              }
            />
            <GridItem xs={1}>
              {!this.state.isClickedBuilding &&
              !this.state.isClickedGroup &&
              !this.state.isClickedLevel ? (
                <Fab
                  disabled={true}
                  color="primary"
                  onClick={() => {
                    this.setState({
                      isClickedBuilding: false,
                      levels_id: null,
                    });
                  }}
                >
                  <Icon>arrow_back</Icon>
                </Fab>
              ) : null}
              {this.state.isClickedBuilding &&
              !this.state.isClickedGroup &&
              !this.state.isClickedLevel ? (
                <Fab
                  color="primary"
                  onClick={() => {
                    this.setState({
                      isClickedBuilding: false,
                      levels_id: null,
                    });
                  }}
                >
                  <Icon>arrow_back</Icon>
                </Fab>
              ) : null}
              {this.state.isClickedLevel ? (
                <Fab
                  color="primary"
                  onClick={() => {
                    this.setState({
                      isClickedLevel: false,
                      levels_id: null,
                    });
                  }}
                >
                  <Icon>arrow_back</Icon>
                </Fab>
              ) : null}
              {this.state.isClickedGroup && !this.state.isClickedLevel ? (
                <Fab
                  color="primary"
                  onClick={() => {
                    this.setState({
                      isClickedGroup: false,
                      isClickedLevel: true,
                    });
                  }}
                >
                  <Icon>arrow_back</Icon>
                </Fab>
              ) : null}
            </GridItem>
            <GridItem xs={10} md={10}>
              {this.state.sites.length ? (
                <Tabs
                  value={this.state.clickedSite}
                  onChange={this.handleChangeSite}
                  indicatorColor="primary"
                  textColor="primary"
                  style={{
                    border: "1pt solid lightgrey",
                    borderRadius: "2pt",
                  }}
                  centered
                >
                  {this.state.sites.map((a, index) => (
                    <Tab key={index} value={a.sites_id} label={a.name} />
                  ))}
                </Tabs>
              ) : (
                <h1 style={{ color: "gray" }}>No sites</h1>
              )}
            </GridItem>
            <GridItem xs={6} md={1}></GridItem>
          </GridContainer>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitleWhite}>
                Manage your site - {this.state.siteName}
              </h4>
            </CardHeader>
            <CardBody>
              <GridContainer justify="center">
                <GridItem xs={12}>
                  <div style={crumbleContainer}>
                    <p
                      className={classes.crumbleNavigation}
                      onClick={() =>
                        this.setState({
                          isClickedBuilding: false,
                          isClickedLevel: false,
                          levels_id: null,
                          isClickedGroup: false,
                        })
                      }
                    >
                      {this.state.clickedSite
                        ? `/${this.state.siteName}`
                        : null}
                    </p>
                    <p
                      className={classes.crumbleNavigation}
                      onClick={() =>
                        this.setState({
                          isClickedLevel: false,
                          levels_id: null,
                          isClickedGroup: false,
                        })
                      }
                    >
                      {this.state.isClickedBuilding
                        ? `/${this.state.buildingName}`
                        : null}
                    </p>
                    <p
                      className={classes.crumbleNavigation}
                      onClick={() =>
                        this.setState({
                          isClickedLevel: true,
                          isClickedGroup: false,
                        })
                      }
                    >
                      {this.state.levels_id
                        ? `/${this.state.levelName} level`
                        : null}
                    </p>
                    <p>
                      {this.state.isClickedGroup
                        ? `/${this.state.groupName}`
                        : null}
                    </p>
                  </div>
                </GridItem>
                {/* BUILDINGS */}
                {!this.state.isClickedBuilding
                  ? this.state.buildingsFiltered.map((a) => {
                      if (a.sites_id === this.state.clickedSite)
                        return (
                          <GridItem xs={12} sm={12} md={6} key={a.id}>
                            <Card
                              onClick={(e) => {
                                this.handleClickBuilding(a.id);
                              }}
                              className={classes.buildingStyle}
                            >
                              <CardBody color="success">
                                <CardIcon color="success">
                                  <Icon>check</Icon>
                                </CardIcon>
                                <p className={classes.cardCategory}>Building</p>
                                <h3 className={classes.cardTitle}>
                                  {a.building}
                                </h3>
                              </CardBody>
                              <CardFooter stats>
                                <div className={classes.stats}>Footer</div>
                              </CardFooter>
                            </Card>
                          </GridItem>
                        );
                      else return null;
                    })
                  : null}

                {/* LEVELs */}
                {this.state.isClickedBuilding &&
                !this.state.isClickedLevel &&
                !this.state.isClickedGroup ? (
                  this.state.levelsFiltered ? (
                    <div className={classes.tableFadeIn}>
                      <BootstrapTable
                        noDataIndication={"no results found"}
                        bordered={true}
                        hover
                        keyField="id"
                        data={this.state.levelsFiltered}
                        columns={this.state.levelColumns}
                        rowStyle={{ cursor: "pointer" }}
                        cellEdit={cellEditFactory({
                          mode: "click",
                          blurToSave: false,
                          afterSaveCell: (
                            oldValue,
                            newValue,
                            row,
                            column,
                            done
                          ) =>
                            afterSaveCellLevels(
                              oldValue,
                              newValue,
                              row,
                              column,
                              done
                            ),
                        })}
                      />
                      <Button onClick={this.levelOpenModal} color="primary">
                        Add Level
                      </Button>
                      <Modal
                        open={this.state.levelModalOpen}
                        onClose={this.levelCloseModal}
                        BackdropProps={{
                          classes: {
                            root: classes.modalRoot,
                          },
                        }}
                      >
                        <div
                          style={{ top: "45vh", left: "45%" }}
                          className={classes.paper}
                        >
                          <h5>Create new level?</h5>
                          <div
                            style={{
                              width: "100%",
                              backgroundColor: "black",
                              height: "1px",
                              marginBottom: "20px",
                            }}
                          />
                          <Button
                            color="primary"
                            onClick={this.handleCreateLevel}
                          >
                            Confirm
                          </Button>
                          <Button
                            color="secondary"
                            onClick={this.levelCloseModal}
                            style={{ float: "right" }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </Modal>
                    </div>
                  ) : (
                    <Typography>Section Empty</Typography>
                  )
                ) : null}
              </GridContainer>
              {!this.state.isClickedBuilding ? (
                <GridContainer>
                  <GridItem xs={2}>
                    <Modal
                      open={this.state.modalOpen}
                      onClose={this.closeModal}
                    >
                      <div
                        style={{ top: "30vh", left: "40%" }}
                        className={classes.paper}
                      >
                        <h5>New building</h5>
                        <div
                          style={{
                            width: "100%",
                            backgroundColor: "black",
                            height: "1px",
                            marginBottom: "20px",
                          }}
                        />
                        <InputLabel htmlFor="age-native-simple">
                          Building name
                        </InputLabel>
                        <TextField
                          id="outlined-basic"
                          label="Name"
                          variant="outlined"
                          style={{ marginBottom: "20px" }}
                          onChange={(e) =>
                            this.setState({ newBuildingName: e.target.value })
                          }
                        />
                        <InputLabel htmlFor="age-native-simple">
                          Level count
                        </InputLabel>
                        <Slider
                          defaultValue={1}
                          valueLabelDisplay="auto"
                          step={1}
                          marks={true}
                          min={1}
                          max={60}
                          onChange={(e, val) =>
                            this.setState({ newLevelCount: val })
                          }
                        />
                        <Button
                          color="primary"
                          onClick={this.handleCreateBuilding}
                        >
                          Create
                        </Button>
                      </div>
                    </Modal>
                    <Button color="primary" onClick={this.openModal}>
                      Add building
                    </Button>
                  </GridItem>
                </GridContainer>
              ) : null}
              {/* LOCATIONS */}
              {/* <GridContainer justify="center" style={{ minHeight: "100px" }}> //TODO ADJUSTED TO NOT SHOW ANY GROUPS - LEVELS INSTEAD
            {this.state.isClickedLevel && !this.state.isClickedGroup ? (
              <div className={classes.tableFadeIn}>
                <BootstrapTable
                  noDataIndication={"no results found"}
                  bordered={true}
                  hover
                  keyField="id"
                  data={this.state.groupsFiltered}
                  columns={this.state.groupcolumns}
                  cellEdit={cellEditFactory({
                    mode: "click",
                    blurToSave: false,
                    afterSaveCell,
                  })}
                  rowStyle={{ cursor: "pointer" }}
                />
                <IconButton color="primary" onClick={this.insertGroup}>
                  <Icon style={{ fontSize: "1.2em" }}>add_circle_outline</Icon>
                </IconButton>
                
              </div>
            ) : null}
          </GridContainer> */}
              {this.state.isClickedLevel ? (
                <div className={classes.tableFadeIn}>
                  <GroupsTable
                    lights={this.state.lightsFiltered}
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

                  <CardBody>
                    <Typography variant="h5">Edit floorplan</Typography>
                    <Floorplan
                      clickedLvl={this.state.levels_id}
                      devices={this.state.lightsFiltered}
                    />
                  </CardBody>

                  {this.state.showInsertPopup ? (
                    <div className="popup">
                      <div className="popupInnerBg">
                        <div className="popupInner2">
                          <div className="buttonContainer">
                            <IconButton
                              color="secondary"
                              onClick={() =>
                                this.setState({
                                  showInsertPopup: false,
                                })
                              }
                            >
                              <Icon>cancel</Icon>
                            </IconButton>
                          </div>

                          {/* EXISTING DEVICE */}
                          <div style={{ textAlign: "center" }}>
                            <h4>Move existing device</h4>
                          </div>
                          <div style={{ fontSize: "0.8em" }}>
                            <table>
                              <tbody>
                                {this.state.lights.map((light, index) => (
                                  <tr key={index}>
                                    <td>
                                      {light.device_id} - {light.type} -{" "}
                                      {light.group_name}
                                    </td>
                                    <td>
                                      <Button
                                        color="primary"
                                        onClick={() => {
                                          console.log(
                                            `move ${light.id} to group id ${this.state.lgt_groups_id}`
                                          );
                                          this.moveHandle(light);
                                        }}
                                      >
                                        Move
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CardBody>
          </Card>
          {this.state.clickedSite !== null && !this.state.isClickedLevel ? (
            <Card>
              <CardHeader color="info">
                <h4 className={classes.cardTitleWhite}>
                  {this.state.siteName} - live overview
                </h4>
              </CardHeader>
              <CardBody>
                {this.state.isClickedBuilding && !this.state.isClickedLevel ? (
                  this.state.levelsFiltered ? (
                    <OverwatchFloorplan
                      clickedBuilding={this.state.clickedBuilding}
                    />
                  ) : (
                    <Typography>Section Empty</Typography>
                  )
                ) : (
                  <Typography variant="h5">
                    Click on a building to display it's overview
                  </Typography>
                )}
              </CardBody>
            </Card>
          ) : null}
        </CardBody>
      </div>
    );
  }
}

export default withStyles(styles)(groups);
