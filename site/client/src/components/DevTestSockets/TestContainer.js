import React from "react";
import Button from "@material-ui/core/Button";
import BootstrapTable from "react-bootstrap-table-next";

export default function TestContainer(props) {
  const [selectedDevices, setSelectedDevices] = React.useState();

  const testColumns = [
    {
      dataField: "id",
      text: "Record ID",
      sort: true,
      hidden: true,
    },
    {
      dataField: "device_id",
      text: "Device ID",
      sort: true,
      editable: false,
    },
    {
      dataField: "type",
      text: "Type",
      sort: true,
      editable: false,
    },
    {
      dataField: "group_name",
      text: "Location",
      sort: true,
      editable: false,
      formatter: (cellContent, row, rowIndex) => {
        return <span>{`${row.building} - ${row.level} level`}</span>;
      },
    },
    {
      dataField: "level",
      text: "",
      sort: true,
      hidden: true,
    },
    {
      dataField: "building",
      text: "",
      sort: true,
      hidden: true,
    },
    {
      dataField: "node_id",
      text: "BMesh Address",
      sort: true,
      editable: false,
      headerStyle: (colum, colIndex) => {
        return { width: "100px" };
      },
    },
    {
      dataField: "powercut",
      text: "powercut",
      sort: true,
      hidden: true,
    },
    {
      dataField: "duration",
      text: "Time left",
      sort: true,
      hidden: true,
    },
    {
      dataField: "",
      text: "Progress",
      editable: false,
      align: "center",
      headerStyle: (colum, colIndex) => {
        return { width: "160px", textAlign: "center" };
      },
      //   formatter: (cellContent, row, rowIndex) => {
      //     if (row.powercut === 0) return <span>Awaiting Start</span>;
      //     if (row.duration > 0 && row.powercut === 1) {
      //       var duration = moment.duration(row.duration);
      //       var percentage = ((row.duration / row.durationStart) * 100).toFixed(
      //         0
      //       );
      //       var progress = 100 - percentage;

      //       return (
      //         <CircularProgressWithLabel value={progress} duration={duration} />
      //       );
      //     }
      //     if (row.duration === 0 && row.powercut === 1) {
      //       return <div>Awaiting review</div>;
      //     }
      //     if (row.powercut === 2) {
      //       return <span style={{ textAlign: "center" }}>Power back on</span>;
      //     }
      //     if (row.powercut === 3) {
      //       return <span>Bluetooth module not responding</span>;
      //     }
      //   },
    },
    {
      dataField: "userInput",
      text: "Device state",
      editable: true,
      align: "center",
      editor: {
        options: [
          {
            value: "",
            label: "",
          },
          {
            value: "OK",
            label: "OK",
          },
          {
            value: "Lamp Fault",
            label: "Lamp Fault",
          },
          {
            value: "Battery Fault",
            label: "Battery Fault",
          },
          {
            value: "No connection to Mesh",
            label: "No connection to Mesh",
          },
        ],
      },
      headerStyle: (colum, colIndex) => {
        return { width: "250px", textAlign: "center" };
      },
      formatter: (cellContent, row) => {
        if (cellContent === "") {
          return <Button color="primary">review</Button>;
        } else return cellContent;
      },
    },
    {
      dataField: "clicked",
      text: "",
      hidden: true,
    },
    {
      dataField: "actions",
      text: "",
      align: "center",
      editable: false,
      //   formatter: (cellContent, row) => {
      //     var disabled = false;
      //     if (row.powercut > 0 || row.clicked > 0) disabled = true;
      //     if (this.state.clickedStartAll) disabled = true;
      //     return (
      //       <Button
      //         color="primary"
      //         disabled={disabled}
      //         onClick={() => {
      //           this.cutPowerSingle(row.id);
      //         }}
      //       >
      //         Start em test
      //       </Button>
      //     );
      //   },
    },
  ];

  const selectRow = {
    mode: "checkbox",
    clickToSelect: true,
    onSelect: (row, isSelect, rowIndex, e) => {
      if (isSelect) {
        setSelectedDevices([...selectedDevices, row]);
      }
      if (!isSelect) {
        setSelectedDevices(
          selectedDevices.filter((el) => el.lights_id !== row.lights_id)
        );
      }
    },
    onSelectAll: (isSelect, rows, e) => {
      if (isSelect) {
        setSelectedDevices(rows);
      }
      if (!isSelect) {
        setSelectedDevices([]);
      }
    },
  };

  return (
    <div style={{ paddingTop: "20px" }}>
      <BootstrapTable
        // noDataIndication={() => <NoDataIndication />}
        bordered={true}
        hover
        keyField="id"
        data={props.devices}
        columns={testColumns}
        // rowStyle={rowStyle}
        selectRow={selectRow}
        // cellEdit={cellEditFactory({
        //   mode: "click",
        //   afterSaveCell: afterSaveCell,
        //   blurToSave: true,
        // })}
      />
    </div>
  );
}
