import React from "react";
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
      title: "Parent device ID",
    },
    {
      field: "sensor_type",
      title: "Sensor type",
    },
    {
      field: "node_id",
      title: "Mesh Address",
    },
  ];

  //   const bulkEdit = async (updateData) => {
  //     let result = await axios({
  //       //Axios POST request
  //       method: "post",
  //       headers: {
  //         "Content-Type": "application/json;charset=UTF-8",
  //         Authorization: "Bearer " + localStorage.usertoken,
  //       },
  //       url: global.BASE_URL + "/api/lights/bulkedit",
  //       data: {
  //         update_data: updateData,
  //       },
  //       timeout: 0,
  //     });
  //     return result;
  //   };

  const updateDevice = async (updateData) => {
    let parentID;
    if (updateData.device_id) {
      let resultLights = await axios({
        method: "get",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
        url:
          global.BASE_URL +
          "/api/lights/device_id/" +
          `${updateData.device_id}/${props.clickedLevel}`,
        timeout: 0,
      });

      parentID = resultLights.data[0].id;
    } else parentID = null;

    let result = await axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/sensors/edit/" + updateData.id,
      data: {
        type: updateData.sensor_type,
        parent_id: parentID,
        node_id: updateData.node_id,
      },
      timeout: 0,
    });
    return result;
  };

  const addDevice = async (updateData) => {
    let parentID;
    if (updateData.device_id) {
      let resultLights = await axios({
        method: "get",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
        url:
          global.BASE_URL +
          "/api/lights/device_id/" +
          `${updateData.device_id}/${props.clickedLevel}`,
        timeout: 0,
      });

      parentID = resultLights.data[0].id;
    } else parentID = null;

    let result = await axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/sensors/add",
      data: {
        node_id: updateData.node_id,
        type: updateData.sensor_type,
        parent_id: parentID,
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
      url: global.BASE_URL + "/api/sensors/" + data.id,
      timeout: 0,
    });
    return result;
  };

  let editable = {
    onRowAdd: (newData) =>
      new Promise((resolve, reject) => {
        addDevice(newData).then((res) => {
          console.log(res);
          props.handleEditSensor(newData, {}, "add");
          resolve();
        });
      }),
    onRowUpdate: (newData, oldData) =>
      new Promise((resolve, reject) => {
        updateDevice(newData).then((res) => {
          console.log(res);
          props.handleEditSensor(newData, oldData, "update");
          resolve();
        });
      }),
    onRowDelete: (oldData) =>
      new Promise((resolve, reject) => {
        deleteDevice(oldData).then((res) => {
          console.log(res);
          props.handleEditSensor({}, oldData, "delete");
          resolve();
        });
      }),
  };

  if (!props.editable) {
    editable = {};
  }
  return (
    <MaterialTable
      columns={columns}
      onRowClick={(event, rowData) =>
        console.log(props.sensors[props.sensors.indexOf(rowData)])
      }
      data={props.devices}
      title="Sensors"
      editable={editable}
    />
  );
}
