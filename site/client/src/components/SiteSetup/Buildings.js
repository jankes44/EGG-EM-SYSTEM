import React from "react";
import NoDataIndication from "components/NoDataIndication/NoDataIndicationTable";
import "./table.css";
import MaterialTable from "material-table";

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

  const editable = {
    onRowAdd: (newData) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          //   setData([...data, newData]);
          props.handleEditBuilding(newData, {}, "add");
          resolve();
        }, 1000);
      }),
    onRowUpdate: (newData, oldData) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          //   const dataUpdate = [...data];
          //   const index = oldData.tableData.id;
          //   dataUpdate[index] = newData;
          //   setData([...dataUpdate]);
          props.handleEditBuilding(newData, oldData, "update");

          resolve();
        }, 1000);
      }),
    onRowDelete: (oldData) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          //   const dataDelete = [...data];
          //   const index = oldData.tableData.id;
          //   dataDelete.splice(index, 1);
          //   setData([...dataDelete]);
          props.handleEditBuilding({}, oldData, "delete");
          resolve();
        }, 1000);
      }),
  };

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
