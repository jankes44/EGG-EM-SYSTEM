import React from "react";
import NoDataIndication from "components/NoDataIndication/NoDataIndicationTable";
import Icon from "@material-ui/core/Icon";
import MaterialTable from "material-table";

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
    },
    {
      field: "node_id",
      title: "Mesh Address",
    },
    {
      field: "",
      title: "Battery",
    },
    {
      field: "",
      title: "Luminance",
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
