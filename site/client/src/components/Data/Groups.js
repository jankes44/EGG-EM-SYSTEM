import React, { Component } from "react";
import axios from "axios";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Icon from "@material-ui/core/Icon";
import GroupsTable from "components/Data/GroupsTable.js";
import Button from "@material-ui/core/Button";
import CardBody from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import { withStyles } from "@material-ui/core/styles";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import Snackbar from "components/Snackbar/Snackbar";
import AddAlert from "@material-ui/icons/AddAlert";

// const textWhite = {
//   color: "white",
// };

// const capitalize = {
//   textTransform: "capitalize"
// };

// const textAlign = {
//   textAlign: "center",
// };

const heading = {
  textDecoration: "none",
  fontSize: "2em",
  color: "grey",
};

const styles = {
  root: {
    backgroundColor: "transparent",
    boxShadow: "none",
    padding: "20px",
    marginBottom: "0px",
  },
};

class groups extends Component {
  state = {
    levels: [],
    groups: [],
    groupsFiltered: [],
    lights: [],
    lightsFiltered: [],
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
        dataField: "group_name",
        text: "Locations",
        sort: true,
        editable: false,
        headerStyle: () => {
          return { width: "30vw" };
        },
        style: {
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        },
      },
      {
        dataField: "lights_count",
        text: "Devices",
        sort: true,
        editable: false,
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
        text: "Location Name",
        sort: true,
        headerStyle: () => {
          return { width: "180px" };
        },
      },
      {
        dataField: "device",
        text: "Devices",
        sort: true,
        editable: false,
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
        this.setState({
          levels: response.data,
        });
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
    axios
      //route to lights of group id = this.state.rowId
      .get(global.BASE_URL + "/api/lights/", {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
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
    this.callLevels();
    this.callGroups();
    this.callLights();
  }

  handleClickLevel = (levels_id) => (e) => {
    this.setState({ isClickedLevel: true }, () => {
      this.setState({
        levels_id: levels_id,
        groupsFiltered: this.state.groups.filter((group) => {
          if (group.levels_id === levels_id) {
            return group;
          } else return null;
        }),
      });
    });
  };

  handleClickGroup = (e, row) => (event) => {
    e.stopPropagation();
    console.log(row.id);
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
        this.callLights();
        this.callGroups();
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
    lightsCopy.push({
      id: lightsCopy[lightsCopy.length - 1].id + 1,
      group_name: this.state.lightsFiltered[0].group_name,
      lgt_groups_id: this.state.lgt_groups_id,
      node_id: null,
      type: null,
      device_id: null,
    });
    newRows.push({
      id: lightsCopy[lightsCopy.length - 1].id,
      group_name: this.state.lightsFiltered[0].group_name,
      lgt_groups_id: this.state.lgt_groups_id,
    });
    this.setState({ lights: lightsCopy }, () => {
      this.setState({
        lightsFiltered: this.state.lights.filter((light) => {
          if (light.lgt_groups_id === this.state.lgt_groups_id) {
            return light;
          } else return null;
        }),
      });
    });
    this.setState({ newRows: newRows });
  };

  clearNewRows = () => {
    this.setState({ newRows: [] });
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

  editHandler = (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure?")) {
      axios
        .post(
          "http://" +
            global.BASE_URL +
            "/api/groups/" +
            parseInt(this.state.clickedGroup),
          this.state,
          {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
              Authorization: "Bearer " + localStorage.usertoken,
            },
          }
        )
        .then((response) => {
          this.callLights();
          this.callGroups();
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    }
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

    const rowEventsLevels = {
      onClick: (e, row, rowIndex) => {
        this.state.levels.forEach((level) => {
          if (level.id === row.id) {
            this.setState({ levelName: level.level });
          }
        });
        this.setState({
          isClickedLevel: true,
          levels_id: row.id,
          groupsFiltered: this.state.groups.filter((group) => {
            if (group.levels_id === row.id) {
              return group;
            } else return null;
          }),
        });
      },
    };

    const rowEventsGroups = {
      onClick: (e, row, rowIndex) => {
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
    };

    const afterSaveCell = (oldValue, newValue, row, column, done) => {
      const colName = column.dataField;

      if (newValue) {
        if (
          window.confirm(
            `Are you sure you want to edit this cell with new value of ${newValue}?`
          )
        ) {
          axios
            .post(
              "http://" +
                global.BASE_URL +
                "/api/groups/edit/" +
                parseInt(row.id),
              [colName, newValue],
              {
                headers: {
                  "Content-Type": "application/json;charset=UTF-8",
                  Authorization: "Bearer " + localStorage.usertoken,
                },
              }
            )
            .then((response) => {
              this.callLevels();
              console.log(response);
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          this.setState({ showSnackBarCancel: true });
          this.callGroups();
        }
      } else this.callGroups();
    };

    const { classes } = this.props;
    return (
      <div>
        <CardBody classes={{ root: classes.root }}>
          <Snackbar
            message={"Cancelled action"}
            close
            icon={AddAlert}
            color="warning"
            place={"bl"}
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
            place={"bl"}
            open={this.state.showSnackbarSuccess}
            closeNotification={() =>
              this.setState({ showSnackbarSuccess: false })
            }
          />
          <GridContainer justify="center">
            <GridItem xs={12}>
              <h1 style={heading}>
                Scottish Parliament/Queensberry House
                {this.state.levels_id ? `/${this.state.levelName} level` : null}
                {this.state.isClickedGroup ? `/${this.state.groupName}` : null}
              </h1>
              {this.state.isClickedLevel ? (
                <IconButton
                  color="primary"
                  onClick={() => {
                    this.setState({
                      isClickedLevel: false,
                      levels_id: null,
                    });
                  }}
                >
                  <Icon style={{ fontSize: "1.2em" }}>arrow_back_ios</Icon>
                </IconButton>
              ) : null}
              {this.state.isClickedGroup && !this.state.isClickedLevel ? (
                <IconButton
                  color="primary"
                  onClick={() => {
                    this.setState({
                      isClickedGroup: false,
                      isClickedLevel: true,
                    });
                  }}
                >
                  <Icon style={{ fontSize: "1.2em" }}>arrow_back_ios</Icon>
                </IconButton>
              ) : null}
            </GridItem>
            {/* LEVEL NODES */}
            {!this.state.isClickedLevel && !this.state.isClickedGroup ? (
              <div style={{ margin: "30px" }}>
                <BootstrapTable
                  noDataIndication={"no results found"}
                  bordered={false}
                  hover
                  keyField="id"
                  data={this.state.levels}
                  columns={this.state.levelColumns}
                  rowEvents={rowEventsLevels}
                  rowStyle={{ cursor: "pointer" }}
                />
              </div>
            ) : null}
          </GridContainer>
          {/* LOCATIONS TABLE */}
          <GridContainer justify="center" style={{ minHeight: "100px" }}>
            {this.state.isClickedLevel ? (
              <div style={{ margin: "30px" }}>
                <BootstrapTable
                  noDataIndication={"no results found"}
                  bordered={false}
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
                  rowEvents={rowEventsGroups}
                />
                <IconButton color="primary" onClick={this.insertGroup}>
                  <Icon style={{ fontSize: "1.2em" }}>add_circle_outline</Icon>
                </IconButton>
              </div>
            ) : null}
          </GridContainer>
          {this.state.isClickedGroup && !this.state.isClickedLevel ? (
            <div style={{ marginTop: "-60px" }}>
              <GroupsTable
                lights={this.state.lightsFiltered}
                callLights={this.callLights}
                callGroups={this.callGroups}
                selectOptions={this.state.groups}
                deleteDevice={this.deleteDevice}
                newRows={this.state.newRows}
                clearNewRows={this.clearNewRows}
              />
              <Button
                color="primary"
                onClick={() => this.setState({ showInsertPopup: true })}
              >
                Move Existing
              </Button>
              <Button color="primary" onClick={this.insertHandle}>
                Insert Empty
              </Button>

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

              {/* <Button variant="contained" style={{ float: "right" }}>
                <CloudUploadIcon /> Insert Devices
              </Button> */}
            </div>
          ) : null}
        </CardBody>
      </div>
    );
  }
}

export default withStyles(styles)(groups);
