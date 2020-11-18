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

var updateData = [];

class GroupsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderCheck: false,
      selectOptions: [],
      selectOptions2: [],
      showTooltip: true,
      showSnackbar: true,
      showSnackbarCancel: false,
      showSnackbarEdit: false,
      showSnackbarReusable: false,
      snackbarMsg: "",
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
    this.callAllGroups();
  }

  callLightsGroups = () => {
    this.props.callLights();
    this.props.callGroups();
  };

  callAllGroups = () => {
    axios
      .get(global.BASE_URL + "/api/groups/selectoptions", {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((result) => {
        this.setState({
          selectOptions: result.data,
        });
      });
  };

  autoClose = (time, stateObject) => {
    setTimeout(() => {
      this.setState({ [stateObject]: false });
    }, time);
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

  saveRecords = () => {
    if (updateData.length > 0) {
      axios
        .post(
          global.BASE_URL + "/api/lights/testeditmany",
          { updateData },
          {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
              Authorization: "Bearer " + localStorage.usertoken,
            },
          }
        )
        .then((response) => {
          this.callLightsGroups();
          this.setState({
            showSnackbarEdit: true,
          });
          setTimeout(() => {
            updateData = [];
          }, 500);
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    } else
      this.setState({
        showSnackbarReusable: true,
        snackbarMsg: "Nothing changed",
        showSnackbarEdit: false,
      });
  };

  render() {
    const afterSaveCell = (oldValue, newValue, row, column, done) => {
      const colName = column.dataField;
      if (newValue !== oldValue && newValue !== "") {
        var object = {};
        object.row = row.id;
        object.colName = colName;
        object.newValue = newValue;

        if (object.colName === "group_name") {
          object.colName = "lgt_groups_id";
        }

        updateData.forEach((x, index) => {
          if (x.row === row.id && x.colName === colName) {
            updateData.splice(index, 1);
          }
        });

        updateData.push(object);
        console.log(updateData);
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
      3000
    );

    if (this.state.SnackbarDelete.showSnackbarDelete === true) {
      setTimeout(() => {
        this.closeDelete();
      }, 3000);
    }

    return (
      <div className="container">
        {/* SnackbarS */}
        <div>
          <Snackbar
            message={this.state.snackbarMsg}
            close
            icon={AddAlert}
            color="warning"
            place={"bl"}
            open={this.state.showSnackbarReusable}
            closeNotification={() =>
              this.setState({ showSnackbarReusable: false })
            }
          />
          <Snackbar
            message={
              "Click on a cell and click enter to confirm to edit a device!"
            }
            close
            icon={AddAlert}
            color="info"
            place={this.state.place}
            open={this.state.showSnackbar}
            closeNotification={() => this.setState({ showSnackbar: false })}
          />
          <Snackbar
            message={`Successfully edited ${updateData.length} cell/s`}
            close
            icon={AddAlert}
            color="success"
            place={"bl"}
            open={this.state.showSnackbarEdit}
            closeNotification={() => this.setState({ showSnackbarEdit: false })}
          />
          <Snackbar
            message={"Cancelled action"}
            close
            icon={AddAlert}
            color="warning"
            place={"bl"}
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
            place={"bl"}
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
          style={{ width: "100%" }}
          cellEdit={cellEditFactory({
            mode: "click",
            blurToSave: true,
            afterSaveCell,
          })}
          // pagination={pagination}
        />
        <button onClick={this.saveRecords}>Save</button>
      </div>
    );
  }
}

export default withRouter(GroupsTable);
