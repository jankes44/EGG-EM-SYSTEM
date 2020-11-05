import React from "react";
import NoDataIndication from "components/NoDataIndication/NoDataIndicationTable";
import MaterialTable from "material-table";

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
      field: "devices",
      title: "Luminaires",
      sort: true,
    },
    {
      field: "lights_count",
      title: "Luminaires count",
      sort: true,
    },
  ];

  const editable = {
    onRowAdd: (newData) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          //   setData([...data, newData]);
          props.handleEditLevel(newData, {}, "add");
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
          props.handleEditLevel(newData, oldData, "update");

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
          props.handleEditLevel({}, oldData, "delete");
          resolve();
        }, 1000);
      }),
  };

  return (
    <MaterialTable
      columns={columns}
      onRowClick={props.handleClickLevel}
      data={props.levels}
      title="Levels"
      editable={editable}
    />
    // <div>
    //   <ToolkitProvider
    //     keyField="id"
    //     data={props.levels}
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
