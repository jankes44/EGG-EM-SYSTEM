import "bootstrap/dist/css/bootstrap.css";
import React, { Component } from "react";
import cellEditFactory, { Type } from "react-bootstrap-table2-editor";
import axios from "axios";
// import paginationFactory from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import { withRouter } from "react-router-dom";
import Snackbar from "components/Snackbar/Snackbar";
import AddAlert from "@material-ui/icons/AddAlert";
import Button from "@material-ui/core/Button";
import jwt_decode from "jwt-decode";

var updateData = [];
var usersId;

class GroupsTable extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      updateDataLength: null,
      renderCheck: false,
      selectOptions: [],
      selectOptions2: [],
      showTooltip: true,
      showSnackbar: true,
      showSnackbarCancel: false,
      showSnackbarEdit: false,
      showSnackbarReusable: false,
      snackbarMsg: "default message",
      snackbarColor: "info",
      snackbarPlace: "br",
      SnackbarDelete: {
        id: null,
        type: "",
        showSnackbarDelete: false,
      },

      place: "bc",
      lightscolumns: [
        {
          dataField: "id",
          text: "Record ID",
          sort: true,
          hidden: true,
        },
        {
          dataField: "_",
          text: "Status",
          align: "center",
          editable: false,
          hidden: true,
          headerStyle: (colum, colIndex) => {
            return { width: "100px", textAlign: "center" };
          },
          formatter: (cell, row) => {
            if (row.status === "OK") {
              return (
                <span>
                  <Icon style={{ color: "green" }}>check_circle</Icon>
                </span>
              );
            } else {
              return (
                <span>
                  <Icon style={{ color: "red" }}>cancel</Icon>
                </span>
              );
            }
          },
        },
        {
          dataField: "status",
          text: "Status info",
          sort: true,
          editable: false,
          hidden: true,
        },
        {
          dataField: "device_id",
          text: "Device ID",
          sort: true,
        },
        {
          dataField: "type",
          text: "Type",
          sort: true,
          editor: {
            type: Type.SELECT,
            options: [
              { value: "EX-58", label: "EX-58" },
              { value: "E-51", label: "E-51" },
              { value: "SA-25E", label: "SA-25E" },
              { value: "F-51E", label: "F-51E" },
            ],
          },
        },
        {
          dataField: "group_name",
          text: "Location",
          sort: true,
          editor: {
            type: Type.SELECT,
            getOptions: (setOptions, { row, column }) => {
              return this.state.selectOptions;
            },
          },
          formatter: (cell, row) => {
            // eslint-disable-next-line
            var found = this.state.selectOptions.find((x) => x.value == cell);
            if (found) return found.label;
            else return <span>{`${row.building} - ${row.level} level`}</span>;
          },
        },
        {
          dataField: "node_id",
          text: "BMesh Address",
          sort: true,
        },
        {
          dataField: "id",
          text: "",
          editable: false,
          headerStyle: (colum, colIndex) => {
            return { width: "80px", textAlign: "center" };
          },
          formatter: (cellContent, row, rowIndex) => {
            return (
              <IconButton
                color="secondary"
                onClick={() =>
                  this.handleDelete(row.id, row.device_id, row.type)
                }
              >
                <Icon style={{ fontSize: "1.2em" }}>delete</Icon>
              </IconButton>
            );
          },
        },
      ],
    };
  }

  handleDelete = (rowId, deviceId, type) => {
    if (window.confirm(`Delete device ${deviceId} ${type}?`)) {
      this.props.deleteDevice(rowId);
      axios
        .delete(global.BASE_URL + "/api/lights/" + parseInt(rowId), {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
        })
        .then((response) => {
          this.props.callSites();
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
      let SnackbarDeleteCopy = JSON.parse(
        JSON.stringify(this.state.SnackbarDelete)
      );
      SnackbarDeleteCopy.id = deviceId;
      SnackbarDeleteCopy.type = type;
      SnackbarDeleteCopy.showSnackbarDelete = true;
      this.setState({ SnackbarDelete: SnackbarDeleteCopy });
    }
  };

  componentDidMount() {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    usersId = decoded.id;

    this._isMounted = true;
    this.callAllGroups();
    this.setState({
      showSnackbarReusable: true,
      snackbarMsg: "Cell edit enabled! Click save to apply the changes.",
      snackbarColor: "info",
      snackbarPlace: "br",
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  callLightsGroups = () => {
    this.props.callLights();
    this.props.callGroups();
  };

  callAllGroups = () => {
    axios
      .get(global.BASE_URL + "/api/groups/selectoptions/" + usersId, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((result) => {
        const uniqueArray = result.data.filter((thing, index) => {
          const _thing = JSON.stringify(thing.levels_name);
          const _building = JSON.stringify(thing.buildings_name);
          return (
            index ===
            result.data.findIndex((obj) => {
              return (
                JSON.stringify(obj.levels_name) === _thing &&
                JSON.stringify(obj.buildings_name) === _building
              );
            })
          );
        });
        this.setState({
          selectOptions: uniqueArray,
        });
      });
  };

  autoClose = (time, stateObject) => {
    if (this._isMounted) {
      setTimeout(() => {
        this.setState({ [stateObject]: false });
      }, time);
    }
  };

  closeDelete = () => {
    let SnackbarDeleteCopy = JSON.parse(
      JSON.stringify(this.state.SnackbarDelete)
    );
    SnackbarDeleteCopy.showSnackbarDelete = false;
    this.setState({ SnackbarDelete: SnackbarDeleteCopy });
  };

  closeSnackbar = (stateObject, setStateObject, time) => {
    if (stateObject === true) {
      setTimeout(() => {
        this.setState({ [setStateObject]: !stateObject });
      }, time);
    }
  };

  validator = (newValue, row, column) => {};

  saveRecords = () => {
    let newRows = this.props.newRows;

    if (updateData.length > 0 || newRows.length > 0) {
      if (
        window.confirm(
          `Are you sure you want to update ${this.state.updateDataLength} cell/s?`
        )
      ) {
        axios
          .post(
            global.BASE_URL + "/api/lights/testeditmany",
            { updateData, newRows },
            {
              headers: {
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: "Bearer " + localStorage.usertoken,
              },
            }
          )
          .then((response) => {
            this.props.callGroups();

            this.setState({
              showSnackbarEdit: true,
            });
            setTimeout(() => {
              updateData = [];
              this.props.clearInsertCounter();
              this.props.clearNewRows();
              this.props.callLights();
            }, 1000);
            console.log(response);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } else
      this.setState({
        snackbarPlace: "br",
        snackbarColor: "warning",
        showSnackbarReusable: true,
        snackbarMsg: "Nothing changed",
        showSnackbarEdit: false,
      });
  };

  revertRecords = () => {
    setTimeout(() => {
      updateData = [];
      this.props.clearInsertCounter();
      this.props.clearNewRows();
      this.setState({
        snackbarPlace: "br",
        snackbarColor: "success",
        showSnackbarReusable: true,
        snackbarMsg: "Reverted",
      });
    }, 500);
    this.props.callLights();
  };

  render() {
    const afterSaveCell = (oldValue, newValue, row, column) => {
      const colName = column.dataField;
      if (newValue !== oldValue && newValue !== "") {
        var object = {};
        object.row = row.id;
        object.colName = colName;
        object.newValue = newValue;

        if (object.colName === "group_name") {
          object.colName = "lgt_groups_id";
        }

        if (object.colName === "device_id") {
          if (parseInt(newValue)) {
            updateData.forEach((x, index) => {
              if (x.row === row.id && x.colName === colName) {
                updateData.splice(index, 1);
              }
            });

            updateData.push(object);

            this.setState({ updateDataLength: updateData.length });
          } else
            this.setState({
              snackbarColor: "warning",
              snackbarPlace: "br",
              snackbarMsg: "Only number values in this field",
              showSnackbarReusable: true,
            });
        }
        if (object.colName !== "device_id") {
          updateData.forEach((x, index) => {
            if (x.row === row.id && x.colName === colName) {
              updateData.splice(index, 1);
            }
          });

          updateData.push(object);

          this.setState({ updateDataLength: updateData.length });
        }
      }
      // this.callLightsGroups();
    };

    //Hide Snackbars automatically
    this.closeSnackbar(this.state.showSnackbar, "showSnackbar", 3000);
    this.closeSnackbar(
      this.state.showSnackbarCancel,
      "showSnackbarCancel",
      3000
    );
    this.closeSnackbar(this.state.showSnackbarEdit, "showSnackbarEdit", 5000);
    this.closeSnackbar(
      this.state.showSnackbarReusable,
      "showSnackbarReusable",
      5000
    );

    if (
      this.state.SnackbarDelete.showSnackbarDelete === true &&
      this._isMounted
    ) {
      setTimeout(() => {
        this.closeDelete();
      }, 3000);
    }

    return (
      <div>
        {/* SnackbarS */}
        <div style={{ zIndex: "2" }}>
          <Snackbar
            message={this.state.snackbarMsg}
            close
            icon={AddAlert}
            color={this.state.snackbarColor}
            place={this.state.snackbarPlace}
            open={this.state.showSnackbarReusable}
            closeNotification={() =>
              this.setState({ showSnackbarReusable: false })
            }
          />
          <Snackbar
            message={`Successfully edited ${this.state.updateDataLength} cell/s`}
            close
            icon={AddAlert}
            color="success"
            place={"br"}
            open={this.state.showSnackbarEdit}
            closeNotification={() => this.setState({ showSnackbarEdit: false })}
          />
          <Snackbar
            message={"Cancelled action"}
            close
            icon={AddAlert}
            color="warning"
            place={"br"}
            open={this.state.showSnackbarCancel}
            closeNotification={() =>
              this.setState({ showSnackbarCancel: false })
            }
          />
          <Snackbar
            message={`Deleted device ${this.state.SnackbarDelete.id} - ${this.state.SnackbarDelete.type}`}
            close
            icon={AddAlert}
            color="warning"
            place={"br"}
            open={this.state.SnackbarDelete.showSnackbarDelete}
            closeNotification={this.closeDelete}
          />
        </div>
        <BootstrapTable
          noDataIndication={"no results found"}
          bordered={true}
          hover
          keyField="id"
          data={this.props.lights}
          columns={this.state.lightscolumns}
          cellEdit={cellEditFactory({
            mode: "click",
            blurToSave: true,
            afterSaveCell,
          })}
          // pagination={pagination}
        />
        <div style={{ float: "right" }}>
          <Button style={{ color: "green" }} onClick={this.saveRecords}>
            Save
          </Button>
          <Button color="secondary" onClick={this.revertRecords}>
            Revert
          </Button>
        </div>
      </div>
    );
  }
}

export default withRouter(GroupsTable);
