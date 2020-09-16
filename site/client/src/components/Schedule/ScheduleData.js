import React from "react";
// import Button from "@material-ui/core/Button";
// import background from "assets/img/trianglify-lowres.png";
// import Icon from "@material-ui/core/Icon";
// import GridItem from "components/Grid/GridItem.js";
import moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, {
  textFilter,
  dateFilter,
} from "react-bootstrap-table2-filter";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";

const ScheduleData = (props) => {
  const dateFormatter = (cell) => {
    return <span>{moment(cell).format("DD.MM.YYYY k:mm:ss")}</span>;
  };

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      props.openEntry(row.id);
    },
  };

  const rowStyle = (row, rowIndex) => {
    var date = new Date();

    if (row.date < date) {
      return { backgroundColor: "salmon" };
    }
    return { cursor: "pointer" };
  };

  const defaultSorted = [
    {
      dataField: "date", // if dataField is not match to any column you defined, it will be ignored.
      order: "desc", // desc or asc
    },
  ];

  const locationFormatter = (
    column,
    colIndex,
    { sortElement, filterElement }
  ) => {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {filterElement}
        {column.text}
      </div>
    );
  };

  const columns = [
    {
      dataField: "id",
      text: "ID",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "80px" };
      },
    },
    {
      dataField: "levels",
      text: "Levels",
      sort: true,
      filter: textFilter(),
      headerFormatter: locationFormatter,
    },
    {
      dataField: "group_name",
      text: "Locations",
      sort: true,
      filter: textFilter(),
      headerStyle: (colum, colIndex) => {
        return { width: "25vw" };
      },
      headerFormatter: locationFormatter,
      style: {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
      },
    },
    {
      dataField: "date",
      text: "Date",
      sort: true,
      formatter: dateFormatter,
      filter: dateFilter(),
      headerFormatter: locationFormatter,
    },
    {
      dataField: "",
      text: "",
      editable: false,
      headerStyle: (colum, colIndex) => {
        return { width: "80px", textAlign: "center" };
      },
      formatter: (cellContent, row, rowIndex) => {
        return (
          <IconButton
            color="secondary"
            onClick={(e) => {
              e.stopPropagation();
              props.handleCancel(row.id);
            }}
          >
            <Icon>delete</Icon>
          </IconButton>
        );
      },
    },
  ];

  const data = [];

  const dataFilter = () => {
    const date = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    props.data.forEach((element) => {
      if (element.date > date) {
        data.push(element);
      }
    });
  };
  dataFilter();

  return (
    <BootstrapTable
      noDataIndication={"no results found"}
      bordered={false}
      hover
      keyField="id"
      filter={filterFactory()}
      data={data}
      columns={columns}
      rowEvents={rowEvents}
      rowStyle={rowStyle}
      defaultSorted={defaultSorted}
    />
  );
};

export default ScheduleData;
