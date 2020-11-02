import React, { useState, useEffect } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import axios from "axios";
import { Icon } from "@material-ui/core";

export default function Devices(props) {
  const [devices, setDevices] = useState([]);

  const callDevices = async () => {
    const data = await axios.get(
      global.BASE_URL + "/api/lights/level/" + props.level,
      {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      }
    );
    console.log(data);
    return data;
  };

  useEffect(() => {
    callDevices().then((res) => setDevices(res.data));
  }, []);

  const columns = [
    {
      dataField: "id",
      text: "Record ID",
      sort: true,
      hidden: true,
    },
    {
      dataField: "_",
      text: "Status",
      align: "center",
      editable: false,
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
      dataField: "status",
      text: "Status info",
      sort: true,
    },
    {
      dataField: "building",
      text: "Building",
      sort: true,
    },
    {
      dataField: "level",
      text: "Level",
      sort: true,
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
      dataField: "node_id",
      text: "Mesh Address",
      sort: true,
    },
  ];
  if (devices)
    return (
      <div style={{ margin: "15px" }}>
        <BootstrapTable
          noDataIndication={"no results found"}
          bordered={true}
          hover
          keyField="id"
          data={devices}
          columns={columns}
        />
      </div>
    );
  else return null;
}
