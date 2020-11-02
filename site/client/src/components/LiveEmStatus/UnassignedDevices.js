import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Button from "@material-ui/core/Button";

export default function UnassignedDevices(props) {
  const [devices, setDevices] = React.useState([]);

  const token = localStorage.usertoken;
  const decoded = jwt_decode(token);
  const user = decoded.id;

  const callDevices = async () => {
    const data = await axios.get(
      global.BASE_URL + "/api/lights/unassigned/" + user,
      {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      }
    );
    return data;
  };

  React.useEffect(() => {
    callDevices().then((res) => {
      console.log(res.data);
      setDevices(res.data);
    });
    //eslint-disable-next-line
  }, []);

  const columns = [
    {
      dataField: "device_id",
      text: "Device ID",
    },
    {
      dataField: "node_id",
      text: "Mesh address",
    },
    {
      dataField: "type",
      text: "Type",
    },
    {
      dataField: "",
      text: "Actions",
      formatter: (cell, row, rowIndex) => {
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              props.assignLight(row);
              setDevices(devices.filter((el) => el.id !== row.id));
            }}
          >
            Assign to this level
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <h4>Unassigned Devices in the building</h4>
      {/* {props.clickedBuilding ? (
        <p>
          {" "}
          {props.clickedBuilding} - {props.clickedLevel} - {props.clickedGroup}
        </p>
      ) : null} */}
      <BootstrapTable
        keyField="id"
        data={devices}
        columns={columns}
        noDataIndication={() => <p>No data</p>}
      />
    </div>
  );
}
