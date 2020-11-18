import React, { useState, useEffect } from "react";
import Groups from "components/Data/GroupsDev";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

function TabPanel(props) {
  const { value, buildings } = props;

  return (
    <div role="tabpanel">
      {buildings.map((a) => {
        if (a.sites_id === value)
          return (
            <p
              key={a.id}
              onClick={() => {
                props.handleClick(a.id);
              }}
            >
              {a.building}
            </p>
          );
        else return null;
      })}
    </div>
  );
}

export default function CenteredTabs() {
  const [value, setValue] = React.useState(1);
  const [sites, setSites] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [clickedBuilding, setClickedBuilding] = useState(null);

  const token = localStorage.usertoken;
  const decoded = jwt_decode(token);
  const usersId = decoded.id;

  useEffect(() => {
    axios
      .get(global.BASE_URL + "/api/sites/" + usersId, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        setSites(response.data);
      });

    axios
      .get(global.BASE_URL + "/api/buildings", {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        setBuildings(response.data);
      });
  }, []);

  const handleClickBldng = (value) => {
    setClickedBuilding(value);
    console.log(value);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        {sites.map((a, index) => (
          <Tab key={index} value={a.sites_id} label={a.name} />
        ))}
      </Tabs>
      <TabPanel
        value={value}
        handleClick={handleClickBldng}
        buildings={buildings}
      />

      <Groups buildingsId={clickedBuilding} />
    </div>
  );
}
