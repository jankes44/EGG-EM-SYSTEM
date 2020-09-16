import "bootstrap/dist/css/bootstrap.css";
import React, { Component } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, {
  textFilter,
  dateFilter,
  selectFilter,
} from "react-bootstrap-table2-filter";
import { withRouter } from "react-router-dom";
import Popup from "components/Popup/Popup.js";
import paginationFactory from "react-bootstrap-table2-paginator";
import moment from "moment";
import axios from "axios";

let columnsGl = [];

class GroupsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
      rowId: null,
      tests: [],
      testsFiltered: [],
      errors: [],
      errorsFiltered: [],
      errorsCsv: [],
    };
  }

  componentDidMount() {
    axios
      .get(global.BASE_URL + "/api/trialtests/lightsresponses", {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.setState({ errors: response.data });
        if (this.props.justFinishedTest && this.props.lastTest) {
          this.filterTests(this.props.lastTest);
          this.togglePopup();
        }

        if (
          this.props.location.state &&
          this.props.location.state.fromDashboard === true
        ) {
          console.log(
            this.props.location.state.fromDashboard,
            this.props.location.state.lastTest,
            this.props.location.state
          );
          this.filterTests(this.props.location.state.lastTest);
          this.togglePopup();
        }
      });
    this.handleSort();
  }

  filterTests = (rowId) => {
    axios
      .get(global.BASE_URL + "/api/trialtests/lightsresponses/csv/" + rowId, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.setState({
          errorsCsv: response.data,
          rowId: rowId,
          testsFiltered: this.props.tests.filter((test) => {
            if (test.id === rowId) {
              return test;
            } else return null;
          }),
          errorsFiltered: this.state.errors.filter((error) => {
            if (error.trial_tests_id === rowId) {
              return error;
            } else return null;
          }),
        });
      });
  };

  handleSort = () => {
    this.table.sortContext.handleSort(columnsGl[0]);
  };

  locationFormatter = (column, colIndex, { sortElement, filterElement }) => {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {filterElement}
        {column.text}
      </div>
    );
  };

  togglePopup = () => {
    this.setState({
      showPopup: !this.state.showPopup,
    });
  };

  render() {
    const dateFormatter = (cell) => {
      return <span>{moment(cell).format("DD.MM.YYYY k:mm:ss")}</span>;
    };

    const selectOptions = {
      Successful: "Successful",
      Failed: "Failed",
      "In Progress": "In Progress",
    };

    const columns = [
      {
        dataField: "id",
        text: "ID",
        sort: true,
        headerStyle: (colum, colIndex) => {
          return { width: "50px" };
        },
      },
      {
        dataField: "site",
        text: "Site",
        sort: true,
        filter: textFilter(),
        headerStyle: () => {
          return {
            width: "100px",
          };
        },
        headerFormatter: this.locationFormatter,
        style: {
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        },
      },
      {
        dataField: "building",
        text: "Building",
        sort: true,
        filter: textFilter(),
        headerStyle: () => {
          return {
            width: "100px",
          };
        },
        headerFormatter: this.locationFormatter,
        style: {
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        },
      },
      {
        dataField: "level",
        text: "Levels",
        sort: true,
        filter: textFilter(),
        headerStyle: () => {
          return {
            width: "100px",
          };
        },
        headerFormatter: this.locationFormatter,
        style: {
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        },
      },
      {
        dataField: "group_name",
        text: "Locations",
        sort: true,
        filter: textFilter(),
        hidden: true,
        headerStyle: () => {
          return {
            width: "160px",
          };
        },
        headerFormatter: this.locationFormatter,
        style: {
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        },
      },
      {
        dataField: "lights",
        text: "Devices",
        sort: true,
        headerStyle: (colum, colIndex) => {
          return { width: "60px" };
        },
      },
      {
        dataField: "errors",
        text: "Warnings",
        sort: true,
        hidden: true,
      },
      {
        dataField: "result",
        text: "Status",
        sort: true,
        filter: selectFilter({
          options: selectOptions,
        }),
        headerFormatter: this.locationFormatter,
        headerStyle: (colum, colIndex) => {
          return { width: "80px" };
        },
      },
      {
        dataField: "set",
        text: "Set",
        sort: true,
        filter: textFilter(),
        headerFormatter: this.locationFormatter,
        headerStyle: (colum, colIndex) => {
          return { width: "90px" };
        },
        style: {
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        },
      },
      {
        dataField: "created_at",
        text: "Start Time",
        sort: true,
        filter: dateFilter({ dateStyle: { width: "140px", margin: "0px" } }),
        formatter: dateFormatter,
        headerFormatter: this.locationFormatter,
        headerStyle: (colum, colIndex) => {
          return { width: "140px" };
        },
      },
    ];

    columnsGl = columns;

    const rowEvents = {
      onClick: (e, row) => {
        this.filterTests(row.id);
        this.togglePopup();
      },
    };

    const options = {
      sizePerPageList: [
        {
          text: "5",
          value: 5,
        },
        {
          text: "10",
          value: 10,
        },
        {
          text: "All",
          value: this.props.tests.length,
        },
      ],
    };

    return (
      <div style={{ marginTop: 20 }}>
        <BootstrapTable
          bootstrap4
          noDataIndication={"no results found"}
          ref={(n) => (this.table = n)}
          wrapperClasses="table-responsive"
          bordered={true}
          hover
          keyField="id"
          data={this.props.tests}
          columns={columns}
          filter={filterFactory()}
          rowEvents={rowEvents}
          rowStyle={{ cursor: "pointer" }}
          pagination={paginationFactory(options)}
        />

        <Popup
          showPopup={this.state.showPopup}
          testsFiltered={this.state.testsFiltered}
          errorsFiltered={this.state.errorsFiltered}
          errorsCsv={this.state.errorsCsv}
          rowId={this.state.rowId}
          text='Click "Close Button" to hide popup'
          closePopup={() => this.togglePopup()}
        />
      </div>
    );
  }
}

export default withRouter(GroupsTable);
