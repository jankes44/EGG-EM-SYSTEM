import React, { useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import GridItem from "components/Grid/GridItem.js";
import { Tabs, Tab, Fab, Icon, Typography } from "@material-ui/core";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import "bootstrap/dist/css/bootstrap.css";
import Skeleton from "@material-ui/lab/Skeleton";
import Overwatch from "components/LiveEmStatus/Overwatch";
import Devices from "components/SiteSetup/Devices";

function NoDataIndication() {
  return (
    <div>
      <Typography variant="h3">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </Typography>
    </div>
  );
}

export default function LiveEmStatus() {
  const [sites, setSites] = React.useState([]);
  const [buildings, setBuildings] = React.useState([]);

  const [clickedSite, setClickedSite] = React.useState(null);
  //eslint-disable-next-line
  const [siteName, setSiteName] = React.useState("");
  const [stage, setStage] = React.useState(1);
  const [backDisabled, setBackDisabled] = React.useState(true);
  const [tabsDisabled, setTabsDisabled] = React.useState(true);
  const [clickedLevel, setClickedLevel] = React.useState(null);
  const [clickedBuilding, setClickedBuilding] = React.useState(null);
  const [clickedGroup, setClickedGroup] = React.useState(null);

  //BOOTSTRAP TABLE VARS
  const { SearchBar } = Search;
  const columns = [
    {
      dataField: "id",
      text: "ID",
      hidden: true,
    },
    {
      dataField: "building",
      text: "Building",
    },
    {
      dataField: "level",
      text: "Level",
    },
    {
      dataField: "devices",
      text: "Luminaires",
    },
  ];

  const setClickedLgtGroup = (id) => {
    setClickedGroup(id);
  };

  const handleChangeSite = (event, site) => {
    if (sites.find((x) => x.sites_id === site) && clickedSite !== site) {
      setTabsDisabled(true);
      setStage(1);
      setBuildings([]);
      callBuildings(site).then((res) => {
        setClickedSite(site);
        setTimeout(() => {
          setBuildings(res.data);
          setTabsDisabled(false);
        }, 500);
      });
    }
  };

  const callSites = () => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const usersId = decoded.id;

    axios
      .get(global.BASE_URL + "/api/sites/" + usersId, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        if (response.data.length) {
          const sites_id = response.data[0].sites_id;
          setSites(response.data);
          setClickedSite(sites_id);
          setSiteName(response.data[0].name);
          callBuildings(sites_id).then((res) => setBuildings(res.data));
          setTabsDisabled(false);
        }
      });
  };
  const callBuildings = async (siteID) => {
    const data = await axios.get(global.BASE_URL + "/api/buildings/" + siteID, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
    });

    return data;
  };

  useEffect(() => {
    callSites();
    // eslint-disable-next-line
  }, []);

  const handleClickRow = (row) => {
    setStage(2);
    setClickedLevel(row.levels_id);
  };

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      console.log(row);
      setClickedBuilding(row.buildings_id);
      handleClickRow(row);
      if (stage >= 1) setBackDisabled(false);
    },
  };

  return (
    <div>
      {clickedSite ? (
        <GridItem xs={12} style={{ margin: "5px" }}>
          <Tabs
            value={clickedSite}
            onChange={handleChangeSite}
            indicatorColor="primary"
            textColor="primary"
            style={{
              border: "1pt solid lightgrey",
              borderRadius: "2pt",
            }}
            centered
          >
            {sites.map((a, index) => (
              <Tab
                key={index}
                disabled={tabsDisabled}
                value={a.sites_id}
                label={a.name}
              />
            ))}
          </Tabs>
        </GridItem>
      ) : null}
      <GridItem
        xs={12}
        style={{ marginTop: "20px", marginBottom: "20px", marginLeft: "5px" }}
      >
        <Fab
          disabled={backDisabled}
          color="primary"
          variant="round"
          onClick={() => {
            if (stage > 1) {
              setStage(stage - 1);
              if (stage > 1) setBackDisabled(true);
              else setBackDisabled(false);
            } else setBackDisabled(true);
          }}
        >
          <Icon style={{ transform: "rotate(-90deg)" }}>navigation</Icon>
        </Fab>
      </GridItem>
      {stage === 1 ? (
        <ToolkitProvider
          keyField="levels_id"
          data={buildings}
          columns={columns}
          search
        >
          {(props) => (
            <div style={{ margin: "20px" }}>
              <SearchBar
                {...props.searchProps}
                style={{ width: "300px", float: "right" }}
              />
              <hr />
              <BootstrapTable
                {...props.baseProps}
                rowEvents={rowEvents}
                noDataIndication={() => <NoDataIndication />}
                hover
                rowStyle={{ cursor: "pointer" }}
              />
            </div>
          )}
        </ToolkitProvider>
      ) : null}
      {stage === 2 && clickedLevel ? (
        <div>
          <div style={{ margin: "15px" }}>
            <Overwatch
              clickedBuilding={clickedBuilding}
              clickedLevel={clickedLevel}
              clickedGroup={clickedGroup}
              setClickedGroup={setClickedLgtGroup}
            />
            <h5>{clickedGroup}</h5>
          </div>
          <Devices level={clickedLevel} />
        </div>
      ) : null}
    </div>
  );
}
