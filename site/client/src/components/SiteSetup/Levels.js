import React from "react";
import NoDataIndication from "components/NoDataIndication/NoDataIndicationTable";
import MaterialTable from "material-table";
import axios from "axios";

export default function Levels(props) {
  const columns = [
    {
      field: "id",
      title: "ID",
      hidden: true,
      sort: true,
    },
    {
      field: "level",
      title: "Level",
      sort: true,
    },
    {
      field: "description",
      title: "Description",
      sort: true,
    },
    {
      field: "devices",
      title: "Luminaires",
      sort: true,
      editable: "never",
    },
    {
      field: "lights_count",
      title: "Luminaires count",
      sort: true,
      editable: "never",
    },
  ];

  const updateLevel = async (updateData) => {
    let result = await axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/levels/edit/" + updateData.id,
      data: {
        level_name: updateData.level,
        description: updateData.description,
      },
      timeout: 0,
    });
    return result;
  };

  const addLevel = async (updateData) => {
    let result = await axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/levels/add",
      data: {
        buildings_id: props.clickedBuilding,
        level: updateData.level,
        description: updateData.description,
      },
      timeout: 0,
    });
    return result;
  };

  const deleteLevel = async (data) => {
    let result = await axios({
      //Axios POST request
      method: "delete",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/levels/" + data.id,
      timeout: 0,
    });
    return result;
  };

  let editable = {
    onRowAdd: (newData) =>
      new Promise((resolve, reject) => {
        //   setData([...data, newData]);
        addLevel(newData).then((res) => {
          props.handleEditLevel(newData, {}, "add");
          resolve();
        });
      }),
    onRowUpdate: (newData, oldData) =>
      new Promise((resolve, reject) => {
        //   const dataUpdate = [...data];
        //   const index = oldData.tableData.id;
        //   dataUpdate[index] = newData;
        //   setData([...dataUpdate]);
        updateLevel(newData).then((res) => {
          console.log(res);
          props.handleEditLevel(newData, oldData, "update");
          resolve();
        });
      }),
    onRowDelete: (oldData) =>
      new Promise((resolve, reject) => {
        //   const dataDelete = [...data];
        //   const index = oldData.tableData.id;
        //   dataDelete.splice(index, 1);
        //   setData([...dataDelete]);
        deleteLevel(oldData).then((res) => {
          console.log(res);
          props.handleEditLevel({}, oldData, "delete");
          resolve();
        });
      }),
  };

  if (!props.editable) editable = {};

  return (
    <MaterialTable
      columns={columns}
      onRowClick={props.handleClickLevel}
      data={props.levels}
      title="Levels"
      editable={editable}
      options={{
        selection: true,
      }}
      actions={[
        {
          tooltip: "Schedule selected",
          icon: "schedule",
          onClick: (evt, data) => props.handleSchedule(data),
        },
      ]}
    />
  );
}
