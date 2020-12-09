import React, { Component } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import axios from "axios";
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";
import paginationFactory from "react-bootstrap-table2-paginator";
import cellEditFactory, { Type } from "react-bootstrap-table2-editor";
import jwt_decode from "jwt-decode";

const NoDataIndication = () => (
  <div
    className="spinner-grow text-info"
    style={{ width: "6rem", height: "6rem" }}
  ></div>
);

export default class UserManagement extends Component {
  state = {
    roles: [],
  };

  componentDidMount() {
    this.props.callUsers();

    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded;

    axios({
      //Axios POST request
      method: "get",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/rolesusers/" + user.access,
    })
      .then((res) => {
        let data = [];
        res.data.forEach((el) => {
          var role = {};
          role.value = el.id;
          role.label = el.name;
          role.accessLevel = el.access;
          data.push(role);
        });
        this.setState({
          roles: data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  deleteUser = (row) => {
    if (window.confirm(`Delete user ${row.first_name} ${row.last_name}?`)) {
      axios({
        //Axios POST request
        method: "delete",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
        url: global.BASE_URL + "/api/rolesusers/users/delete/" + row.id,
      })
        .then((res) => {
          this.props.callUsers();
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  render() {
    const options = {
      sizePerPageList: [
        {
          text: "5",
          value: 5,
        },
        {
          text: "10",
          value: 10,
        },
        {
          text: "all",
          value: this.props.users.length,
        },
      ],
    };

    const columns = [
      {
        dataField: "id",
        text: "ID",
        hidden: true,
      },
      {
        dataField: "first_name",
        text: "First Name",
        hidden: true,
      },
      {
        dataField: "last_name",
        text: "Last Name",
        hidden: true,
      },
      {
        dataField: "full_name",
        text: "User Name",
        editable: false,
        formatter: (cellContent, row) => {
          return (
            <span>
              {row.first_name} {row.last_name}
            </span>
          );
        },
      },
      {
        dataField: "email",
        text: "Email",
      },
      {
        dataField: "role_name",
        text: "Role",
        editor: {
          type: Type.SELECT,
          options: this.state.roles,
        },
        formatter: (cell, row) => {
          // eslint-disable-next-line
          var found = this.state.roles.find((x) => x.value == cell);
          if (found) return found.label;
          else return cell;
        },
      },
      {
        dataField: "canEdit",
        text: "CanEdit",
        hidden: true,
      },
      // {
      //   dataField: "access",
      //   text: "access",
      // },
      {
        dataField: "actions",
        text: "Actions",
        editable: false,
        headerStyle: (colum, colIndex) => {
          return { textAlign: "center" };
        },
        formatter: (cellContent, row, rowId, rowIndex, e) => {
          return (
            <div>
              {row.canEdit ? (
                <IconButton
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.deleteUser(row);
                  }}
                >
                  <Icon style={{ fontSize: "1.2em" }}>delete</Icon>
                </IconButton>
              ) : (
                <IconButton color="secondary" disabled={true}>
                  <Icon style={{ fontSize: "1.2em" }}>delete</Icon>
                </IconButton>
              )}
            </div>
          );
        },
      },
    ];

    const afterSaveCell = (oldValue, newValue, row, column, done) => {
      //ALLOW TO EDIT ONLY IF THE EDITOR HAS ACCESS HIGHER THAN THE USER BEING EDITED //TODO
      if (column.dataField === "role_name") {
        column.dataField = "roles_id";
      }

      axios({
        //Axios POST request
        method: "post",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
        url: global.BASE_URL + "/api/rolesusers/edit/" + row.id,
        data: {
          //data object sent in request's body
          column: column.dataField,
          value: newValue,
        },
      })
        .then((res) => {
          this.props.callUsers();
          console.log(res);
        })
        .catch((err) => console.log(err));
    };

    const beforeSaveCell = (oldValue, newValue, row, column, done) => {
      const token = localStorage.usertoken;
      const decoded = jwt_decode(token);
      const user = decoded;
      const canEdit = user.access >= row.access;
      const self = user.id === row.id && column.dataField === "role_name";

      if (newValue !== "" && !self) {
        if (canEdit) {
          if (window.confirm("Are you sure?")) {
            done();
          } else done(false);
        } else {
          done(false);
          window.alert("No access");
        }
      } else {
        done(false);
      }
      return { async: true };
    };

    return (
      <div className="jumbotron bg-light">
        <h4>UserManagement</h4>
        <BootstrapTable
          noDataIndication={() => <NoDataIndication />}
          keyField="id"
          data={this.props.users}
          columns={columns}
          pagination={paginationFactory(options)}
          cellEdit={cellEditFactory({
            mode: "click",
            blurToSave: true,
            afterSaveCell: afterSaveCell,
            beforeSaveCell: beforeSaveCell,
          })}
        />
      </div>
    );
  }
}
