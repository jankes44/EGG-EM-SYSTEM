import React from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Button from "@material-ui/core/Button";
import MaterialTable from "material-table";

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
      field: "id",
      title: "ID",
      hidden: true,
    },
    {
      field: "device_id",
      title: "Device",
    },
    {
      field: "type",
      title: "Fitting type",
      lookup: {
        "EX-58": "EX-58",
        "F-51E": "F-51E",
        "SA-25E": "SA-25E",
        "S-25AE": "S-25AE",
        "E-51": "E-51",
        "EX-51E": "EX-51E",
      },
    },
    {
      field: "node_id",
      title: "Mesh Address",
    },
    {
      field: "is_assigned",
      title: "Battery",
      editable: "never",
    },
    {
      field: "building",
      title: "Luminance",
      editable: "never",
    },
  ];

  return (
    <MaterialTable
      columns={columns}
      onRowClick={(event, rowData) => {
        const row = devices[devices.indexOf(rowData)];
        console.log(row);
        props.assignLight(row);
        setDevices(devices.filter((el) => el.id !== row.id));
      }}
      data={devices}
      title="Unassigned devices"
    />
  );
}
