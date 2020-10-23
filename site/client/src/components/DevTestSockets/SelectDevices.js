import React from "react";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import Button from "@material-ui/core/Button";

export default function Devices(props) {
  const [selectedDevices, setSelectedDevices] = React.useState([]);
  const [devices, setDevices] = React.useState([]);

  const deviceColumns = [
    {
      dataField: "lights_id",
      text: "Record ID",
      sort: true,
      hidden: true,
    },
    {
      dataField: "device_id",
      text: "Device ID",
      sort: true,
    },
    {
      dataField: "type",
      text: "Type",
      sort: true,
    },
    {
      dataField: "sites_name",
      text: "Site",
      sort: true,
    },
    {
      dataField: "group_name",
      text: "Location",
      sort: true,

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
  React.useEffect(() => {
    axios({
      //Axios GET request
      method: "get",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/lights/building/" + props.clickedBuilding,
    }).then((res) => {
      setDevices(res.data);
    });
  }, [props.clickedBuilding]);

  return (
    <div style={{ paddingTop: "20px" }}>
      <BootstrapTable
        noDataIndication={"no results found"}
        bordered={true}
        hover
        keyField="lights_id"
        data={devices}
        columns={deviceColumns}
        selectRow={selectRow}
      />
      <Button onClick={() => props.initiate(selectedDevices)}>START</Button>
    </div>
  );
}
