import React from "react";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import BootstrapTable from "react-bootstrap-table-next";
import NoDataIndication from "components/NoDataIndication/NoDataIndicationTable";

export default function buildings(props) {
  const { SearchBar } = Search;

  const columns = [
    {
      dataField: "id",
      text: "ID",
      hidden: true,
      sort: true,
    },
    {
      dataField: "level",
      text: "Level",
      sort: true,
    },
    {
      dataField: "devices",
      text: "Luminaires",
      sort: true,
      editable: false,
    },
    {
      dataField: "lights_count",
      text: "Luminaires count",
      sort: true,
      editable: false,
    },
  ];

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      props.handleClickLevel(row);
    },
  };

  return (
    <div>
      <ToolkitProvider
        keyField="id"
        data={props.levels}
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
