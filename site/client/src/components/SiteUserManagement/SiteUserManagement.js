import React, { Component } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import axios from "axios";
import Icon from "@material-ui/core/Icon";
// import IconButton from "@material-ui/core/IconButton";
import paginationFactory from "react-bootstrap-table2-paginator";
import cellEditFactory, { Type } from "react-bootstrap-table2-editor";
import jwt_decode from "jwt-decode";
// import MaterialTable from "material-table";
import Button from "@material-ui/core/Button";

// function MaterialTableDemo() {
//   const [state, setState] = React.useState({
//     columns: [
//       { title: "Name", field: "name" },
//       { title: "Surname", field: "surname" },
//       { title: "Birth Year", field: "birthYear", type: "numeric" },
//       {
//         title: "Birth Place",
//         field: "birthCity",
//         lookup: { 34: "İstanbul", 63: "Şanlıurfa" },
//       },
//     ],
//     data: [
//       { name: "Mehmet", surname: "Baran", birthYear: 1987, birthCity: 63 },
//       {
//         name: "Zerya Betül",
//         surname: "Baran",
//         birthYear: 2017,
//         birthCity: 34,
//       },
//     ],
//   });

//   return (
//     <MaterialTable
//       title="Editable Example"
//       columns={state.columns}
//       data={state.data}
//       editable={{
//         onRowAdd: (newData) =>
//           new Promise((resolve) => {
//             setTimeout(() => {
//               resolve();
//               setState((prevState) => {
//                 const data = [...prevState.data];
//                 data.push(newData);
//                 return { ...prevState, data };
//               });
//             }, 600);
//           }),
//         onRowUpdate: (newData, oldData) =>
//           new Promise((resolve) => {
//             setTimeout(() => {
//               resolve();
//               if (oldData) {
//                 setState((prevState) => {
//                   const data = [...prevState.data];
//                   data[data.indexOf(oldData)] = newData;
//                   return { ...prevState, data };
//                 });
//               }
//             }, 600);
//           }),
//         onRowDelete: (oldData) =>
//           new Promise((resolve) => {
//             setTimeout(() => {
//               resolve();
//               setState((prevState) => {
//                 const data = [...prevState.data];
//                 data.splice(data.indexOf(oldData), 1);
//                 return { ...prevState, data };
//               });
//             }, 600);
//           }),
//       }}
//     />
//   );
// }

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

  revokeAccess = (site, siteName, row) => {
    if (
      window.confirm(
        `Revoke ${row.first_name} ${row.last_name} access to ${siteName}?`
      )
    ) {
      this.props.revokeAccess(row.id, site);
      window.alert("access revoked");
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
      // {
      //   dataField: "actions",
      //   text: "Actions",
      //   editable: false,
      //   headerStyle: (colum, colIndex) => {
      //     return { textAlign: "center" };
      //   },
      //   formatter: (cellContent, row, rowId, rowIndex, e) => {
      //     return (
      //       <div>
      //         {row.canEdit ? (
      //           <IconButton
      //             color="secondary"
      //             onClick={(e) => {
      //               e.stopPropagation();
      //               this.deleteUser(row);
      //             }}
      //           >
      //             <Icon style={{ fontSize: "1em" }}>delete</Icon>
      //           </IconButton>
      //         ) : (
      //           <IconButton color="secondary" disabled={true}>
      //             <Icon style={{ fontSize: "1em" }}>delete</Icon>
      //           </IconButton>
      //         )}
      //       </div>
      //     );
      //   },
      // },
    ];

    const expandRow = {
      renderer: (row) => (
        <div>
          <h6>Users Sites access</h6>
          {this.props.sites.map((el) => {
            if (row.sites.includes(el.sites_id))
              return (
                <div key={el.sites_id}>
                  <div style={{ width: "45%" }}>
                    <p style={{ display: "inline-block" }}>{el.name}</p>
                    <p style={{ color: "green", display: "inline-block" }}>
                      ✔{" "}
                    </p>
                    {row.canEdit ? (
                      <Button
                        color="secondary"
                        style={{ float: "right" }}
                        onClick={() => {
                          this.revokeAccess(el.sites_id, el.name, row);
                        }}
                      >
                        Revoke access
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            else
              return (
                <div key={el.sites_id}>
                  <p style={{ display: "inline-block" }}>{el.name}</p>
                  <p style={{ color: "red", display: "inline-block" }}>
                    <b>X</b>
                  </p>
                </div>
              );
          })}
        </div>
      ),
      showExpandColumn: true,
      onlyOneExpanding: true,
      expandByColumnOnly: true,
      expandHeaderColumnRenderer: ({ isAnyExpands }) => {
        if (isAnyExpands) {
          return (
            <Icon style={{ fontSize: "1.3em" }}>
              <b>&#9207;</b>
            </Icon>
          );
        }
        return (
          <Icon style={{ fontSize: "1.3em" }}>
            <b>&#9205;</b>
          </Icon>
        );
      },
      expandColumnRenderer: ({ expanded }) => {
        if (expanded) {
          return (
            <Icon style={{ fontSize: "1.3em" }}>
              <b>&#9207;</b>
            </Icon>
          );
        }
        return (
          <Icon style={{ fontSize: "1.3em" }}>
            <b>&#9205;</b>
          </Icon>
        );
      },
    };

    const beforeSaveCell = (oldValue, newValue, row, column, done) => {
      const token = localStorage.usertoken;
      const decoded = jwt_decode(token);
      const user = decoded;
      const canEdit = user.access >= row.access;
      const self = user.id === row.id && column.dataField === "role_name";

      console.log(self, column);
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

    return (
      <div className="jumbotron bg-light">
        <h4>UserManagement</h4>
        <BootstrapTable
          hover
          noDataIndication={() => <NoDataIndication />}
          keyField="id"
          data={this.props.users}
          columns={columns}
          pagination={paginationFactory(options)}
          expandRow={expandRow}
          cellEdit={cellEditFactory({
            mode: "click",
            blurToSave: true,
            afterSaveCell: afterSaveCell,
            beforeSaveCell: beforeSaveCell,
          })}
        />
        {/* <MaterialTableDemo /> */}
      </div>
    );
  }
}
