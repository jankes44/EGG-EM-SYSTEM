import React from "react";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import BootstrapTable from "react-bootstrap-table-next";
import NoDataIndication from "components/NoDataIndication/NoDataIndicationTable";
import "./table.css";

export default function buildings(props) {
  const { SearchBar } = Search;

  const columns = [
    {
      dataField: "buildings_id",
      text: "ID",
      hidden: true,
    },
    {
      dataField: "building",
      text: "Building",
    },
    {
      dataField: "address",
      text: "Address",
    },
    {
      dataField: "devices",
      text: "Luminaires count",
    },
  ];

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      props.handleClickBuilding(row);
    },
  };

  return (
    <div>
      <ToolkitProvider
        keyField="buildings_id"
        data={props.buildings}
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
