import React from "react";
import NoDataIndication from "components/NoDataIndication/NoDataIndicationTable";
import "./table.css";
import MaterialTable from "material-table";
import axios from "axios";

export default function buildings(props) {
  const columns = [
    {
      field: "buildings_id",
      title: "ID",
      hidden: true,
    },
    {
      field: "building",
      title: "Building",
    },
    {
      field: "address",
      title: "Address",
    },
    {
      field: "devices",
      title: "Luminaires count",
      editable: "never",
    },
  ];

  const updateBuilding = async (updateData) => {
    let result = await axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/buildings/" + updateData.buildings_id,
      data: {
        building: updateData.building,
        address: updateData.address,
      },
      timeout: 0,
    });
    return result;
  };

  const addBuilding = async (updateData) => {
    let result = await axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/buildings/new-empty",
      data: {
        building: updateData.building,
        address: updateData.address,
        sites_id: props.clickedSite,
      },
      timeout: 0,
    });
    return result;
  };

  const deleteBuilding = async (data) => {
    let result = await axios({
      //Axios POST request
      method: "delete",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/buildings/" + data.buildings_id,
      timeout: 0,
    });
    return result;
  };

  let editable = {
    onRowAdd: (newData) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          //   setData([...data, newData]);
          console.log(newData);
          addBuilding(newData).then((res) => {
            console.log(res);
            props.handleEditBuilding(newData, {}, "add");
            resolve();
          });
        }, 1000);
      }),
    onRowUpdate: (newData, oldData) =>
      new Promise((resolve, reject) => {
        //   const dataUpdate = [...data];
        //   const index = oldData.tableData.id;
        //   dataUpdate[index] = newData;
        //   setData([...dataUpdate]);
        updateBuilding(newData).then((res) => {
          console.log(res);
          props.handleEditBuilding(newData, oldData, "update");

          resolve();
        });
      }),
    onRowDelete: (oldData) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          //   const dataDelete = [...data];
          //   const index = oldData.tableData.id;
          //   dataDelete.splice(index, 1);
          //   setData([...dataDelete]);
          deleteBuilding(oldData).then((res) => {
            props.handleEditBuilding({}, oldData, "delete");
            resolve();
          });
        }, 1000);
      }),
  };

  if (!props.editable) editable = {};

  return (
    <MaterialTable
      columns={columns}
      onRowClick={props.handleClickBuilding}
      data={props.buildings}
      title="Buildings"
      editable={editable}
    />
  );
}
