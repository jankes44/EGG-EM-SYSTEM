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
      title: "Device ID",
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
      url: global.BASE_URL + "/api/lights/edit/many",
      data: {
        update_data: updateData,
      },
      timeout: 0,
    });
    return result;
  };

  const updateDevice = async (updateData) => {
    let result = await axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/lights/edit/single/" + updateData.id,
      data: {
        device_id: updateData.device_id,
        node_id: updateData.node_id,
        type: updateData.type,
      },
      timeout: 0,
    });
    return result;
  };

  const addDevice = async (updateData) => {
    let result = await axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/lights/add",
      data: {
        device_id: updateData.device_id,
        node_id: updateData.node_id,
        type: updateData.type,
        levels_id: props.clickedLevel,
      },
      timeout: 0,
    });
    return result;
  };

  const deleteDevice = async (data) => {
    let result = await axios({
      //Axios POST request
      method: "delete",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/lights/" + data.id,
      timeout: 0,
    });
    return result;
  };

  let editable = {
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
        addDevice(newData).then((res) => {
          console.log(res);
          props.handleEditDevice(newData, {}, "add");
          resolve();
        });
      }),
    onRowUpdate: (newData, oldData) =>
      new Promise((resolve, reject) => {
        updateDevice(newData).then((res) => {
          console.log(res);
          props.handleEditDevice(newData, oldData, "update");
          resolve();
        });
      }),
    onRowDelete: (oldData) =>
      new Promise((resolve, reject) => {
        deleteDevice(oldData).then((res) => {
          console.log(res);
          props.handleEditDevice({}, oldData, "delete");
          resolve();
        });
      }),
  };

  let actions = [
    {
      icon: "add",
      tooltip: "Add 5 empty",
      isFreeAction: true,
      onClick: (event) => addEmpty(),
    },
  ];

  if (!props.editable) {
    editable = {};
    actions = [];
  }

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
  );
}
