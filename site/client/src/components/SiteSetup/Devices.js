import React from "react";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import BootstrapTable from "react-bootstrap-table-next";
import NoDataIndication from "components/NoDataIndication/NoDataIndicationTable";
import Icon from "@material-ui/core/Icon";

export default function buildings(props) {
  const { SearchBar } = Search;

  const columns = [
    {
      dataField: "id",
      text: "ID",
      hidden: true,
    },
    {
      dataField: "status",
      text: "Status",
      align: "center",
      headerStyle: (colum, colIndex) => {
        return { width: "100px", textAlign: "center" };
      },
      formatter: (cell, row) => {
        if (row.status === "OK") {
          return (
            <span>
              <Icon style={{ color: "green" }}>check_circle</Icon>
            </span>
          );
        } else {
          return (
            <span>
              <Icon style={{ color: "red" }}>cancel</Icon>
            </span>
          );
        }
      },
    },
    {
      dataField: "device_id",
      text: "Device ID",
    },
    {
      dataField: "type",
      text: "Fitting type",
    },
  ];

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      // props.handleClickBuilding(row);
    },
  };

  return (
    <div>
      <ToolkitProvider
        keyField="id"
        data={props.devices}
        columns={columns}
        search
      >
        {(props) => (
          <div>
            <SearchBar {...props.searchProps} />
            <hr />
            <BootstrapTable
              {...props.baseProps}
              noDataIndication={() => <NoDataIndication />}
              rowStyle={{ cursor: "pointer" }}
              rowEvents={rowEvents}
              hover
              wrapperClasses="table-responsive"
            />
          </div>
        )}
      </ToolkitProvider>
    </div>
  );
}
