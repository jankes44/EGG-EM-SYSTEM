import "bootstrap/dist/css/bootstrap.css";
import React, { Component } from "react";
import cellEditFactory from "react-bootstrap-table2-editor";
import axios from "axios";
// import paginationFactory from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import { withRouter } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";

class GroupsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderCheck: false,
      selectOptions: [],
      selectOptions2: [],
      scheduleData: [],
      columns: [
        {
          dataField: "schedule_id",
          text: "ID",
          sort: true,
          hidden: true,
        },
        {
          dataField: "date",
          text: "Date",
          sort: true,
        },
        {
          dataField: "schedule_id",
          text: "-",
          editable: false,
          headerStyle: (colum, colIndex) => {
            return { width: "80px", textAlign: "center" };
          },
          formatter: (cellContent, row) => {
            return (
              <IconButton
                color="secondary"
                onClick={() =>
                  this.handleDelete(row.id, row.device_id, row.type)
                }
              >
                <Icon>delete</Icon>
              </IconButton>
            );
          },
        },
      ],
    };
  }

  handleDelete = (rowId, deviceId, type) => {
    if (window.confirm(`Delete device ${deviceId} ${type}?`)) {
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
    }
  };

  componentDidMount() {
    fetch(global.BASE_URL + "/api/schedule", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.usertoken,
      },
    })
      .then((results) => results.json())
      .then((data) => this.setState({ scheduleData: data }))
      .catch(function(error) {
        console.log(error);
      });
  }

  render() {
    // const pagination = paginationFactory({
    //   page: 2,
    //   sizePerPage: 5,
    //   sizePerPageList: [
    //     { text: "5", value: 5 },
    //     { text: "10", value: 10 },
    //     { text: "20", value: 20 },
    //     { text: "50", value: 50 }
    //   ]
    // });

    const afterSaveCell = (oldValue, newValue, row, column, done) => {
      console.log(oldValue, newValue, row.id, column.dataField);
      const colName = column.dataField;

      if (
        window.confirm(
          `Are you sure you want to edit this cell with new value of ${newValue}?`
        )
      ) {
        axios
          .post(
            "http://" +
              global.BASE_URL +
              "/api/lights/edit/" +
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
            console.log(response);
          })
          .catch((error) => {
            console.log(error);
          });
      } else;
    };

    return (
      <div className="container">
        <BootstrapTable
          noDataIndication={"no results found"}
          rowStyle={{ backgroundColor: "whitesmoke", color: "black" }}
          bordered={true}
          hover
          keyField="id"
          data={this.state.scheduleData}
          columns={this.state.columns}
          style={{ width: "100%" }}
          cellEdit={cellEditFactory({
            mode: "dbclick",
            blurToSave: false,
            afterSaveCell,
          })}
          // pagination={pagination}
        />
      </div>
    );
  }
}

export default withRouter(GroupsTable);
