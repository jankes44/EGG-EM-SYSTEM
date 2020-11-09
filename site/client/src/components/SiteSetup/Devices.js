import React from "react";
import NoDataIndication from "components/NoDataIndication/NoDataIndicationTable";
import Icon from "@material-ui/core/Icon";
import MaterialTable from "material-table";
import axios from "axios";

export default function buildings(props) {
  const columns = [
    {
      field: "id",
      title: "ID",
      hidden: true,
    },
    {
      field: "device_id",
      title: "Device",
    },
    {
      field: "type",
      title: "Fitting type",
      lookup: {
        "EX-58": "EX-58",
        "F-51E": "F-51E",
        "SA-25E": "SA-25E",
        "S-25AE": "S-25AE",
        "E-51": "E-51",
        "EX-51E": "EX-51E",
      },
    },
    {
      field: "node_id",
      title: "Mesh Address",
    },
    {
      field: "is_assigned",
      title: "Battery",
      editable: "never",
    },
    {
      field: "building",
      title: "Luminance",
      editable: "never",
    },
  ];

  const addEmpty = async (updateData) => {
    let result = await axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/lights/addempty/5",
      timeout: 0,
    });
    return result;
  };

  const bulkEdit = async (updateData) => {
    let result = await axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/lights/bulkedit",
      data: {
        update_data: updateData,
      },
      timeout: 0,
    });
    return result;
  };

  const editable = {
    onBulkUpdate: (changes) =>
      new Promise((resolve, reject) => {
        bulkEdit(changes).then((res) => {
          console.log(res);
          props.bulkEditDevices(changes);
          resolve();
        });
      }),
    onRowAdd: (newData) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      }),
    onRowUpdate: (newData, oldData) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      }),
    onRowDelete: (oldData) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      }),
  };

  const actions = [
    {
      icon: "add",
      tooltip: "Add 5 empty",
      isFreeAction: true,
      onClick: (event) => addEmpty(),
    },
  ];

  return (
    <MaterialTable
      columns={columns}
      onRowClick={(event, rowData) =>
        console.log(props.devices[props.devices.indexOf(rowData)])
      }
      data={props.devices}
      title="Devices"
      editable={editable}
      actions={actions}
    />
    // <div>
    //   <ToolkitProvider
    //     keyField="id"
    //     data={props.devices}
    //     columns={columns}
    //     search
    //   >
    //     {(props) => (
    //       <div>
    //         <SearchBar {...props.searchProps} />
    //         <hr />
    //         <BootstrapTable
    //           {...props.baseProps}
    //           noDataIndication={() => <NoDataIndication />}
    //           rowStyle={{ cursor: "pointer" }}
    //           rowEvents={rowEvents}
    //           hover
    //           wrapperClasses="table-responsive"
    //         />
    //       </div>
    //     )}
    //   </ToolkitProvider>
    // </div>
  );
}
