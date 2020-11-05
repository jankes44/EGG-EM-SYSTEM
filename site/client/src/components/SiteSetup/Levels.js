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

  return (
    <MaterialTable
      columns={columns}
      onRowClick={props.handleClickLevel}
      data={props.levels}
      title="Levels"
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
