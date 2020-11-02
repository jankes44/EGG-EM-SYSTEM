import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { Tabs, Tab, Typography, Icon, Fab, Tooltip } from "@material-ui/core";
import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import "bootstrap/dist/css/bootstrap.css";
import Skeleton from "@material-ui/lab/Skeleton";
import NewBuilding from "components/SiteSetup/NewBuilding";
import Devices from "components/SiteSetup/Devices";
import NewDevices from "components/SiteSetup/NewDevices";

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

export default function SiteSetup() {
  const [sites, setSites] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [siteName, setSiteName] = React.useState("");
  const [stage, setStage] = React.useState(1);
  const [backDisabled, setBackDisabled] = React.useState(true);
  const [tabsDisabled, setTabsDisabled] = React.useState(true);
  const [clickedGroup, setClickedGroup] = React.useState(null);
  const [clickedLevel, setClickedLevel] = React.useState(null);
  const [clickedBuilding, setClickedBuilding] = React.useState(null);
  const [clickedSite, setClickedSite] = useState(null);
  const [createNewBuilding, setCreateNewBuilding] = useState(false);

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

  const handleNewBuilding = () => {
    setCreateNewBuilding(!createNewBuilding);
  };

  const callSites = async () => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const usersId = decoded.id;

    const data = await axios.get(global.BASE_URL + "/api/sites/" + usersId, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
    });
    return data;
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

  const handleClickRow = (row) => {
    setStage(2);
    setClickedLevel(row.levels_id);
  };

  useEffect(() => {
    callSites().then((res) => {
      const sites_id = res.data[0].sites_id;
      setSites(res.data);
      setClickedSite(sites_id);
      setSiteName(res.data[0].name);
      callBuildings(sites_id).then((res) => setBuildings(res.data));
      setTabsDisabled(false);
    });
  }, []);

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      console.log(row);
      setClickedBuilding(row.buildings_id);
      handleClickRow(row);
      if (stage >= 1) setBackDisabled(false);
    },
  };

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

  const expandRow = {
    renderer: (row) => {
      const levelColumns = [
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
      return (
        <div>
          <BootstrapTable
            keyField="levels_id"
            data={buildings}
            columns={levelColumns}
          />
        </div>
      );
    },
  };

  return (
    <div style={{ margin: "5px" }}>
      <GridItem xs={12}>
        {clickedSite ? (
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
            {sites.map((a, index) => {
              return (
                <Tab
                  key={index}
                  value={a.sites_id}
                  disabled={tabsDisabled}
                  label={a.name}
                />
              );
            })}
          </Tabs>
        ) : null}
      </GridItem>
      <div style={{ margin: "20px", marginLeft: "15px" }}>
        <GridContainer>
          <GridItem xs={1}>
            <Tooltip title="Back" aria-label="add">
              <span>
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
                  <Icon style={{ transform: "rotate(-90deg)" }}>
                    navigation
                  </Icon>
                </Fab>
              </span>
            </Tooltip>
          </GridItem>
          {stage === 1 ? (
            <GridItem xs={1}>
              <Tooltip title="Setup new building" aria-label="add new building">
                <Fab color="primary" onClick={handleNewBuilding}>
                  <Icon>add</Icon>
                  <Icon style={{ fontSize: "1.5em" }}>apartment</Icon>
                </Fab>
              </Tooltip>
            </GridItem>
          ) : null}
          {stage === 1 ? (
            <GridItem xs={1}>
              <NewDevices />
            </GridItem>
          ) : null}
        </GridContainer>
      </div>
      {createNewBuilding ? (
        <div style={{ margin: "15px" }}>
          <NewBuilding clickedSite={clickedSite} />
        </div>
      ) : null}

      {stage === 1 ? (
        <GridItem xs={12}>
          <ToolkitProvider
            keyField="levels_id"
            data={buildings}
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
                  hover
                  rowStyle={{ cursor: "pointer" }}
                  expandRow={expandRow}
                />
              </div>
            )}
          </ToolkitProvider>
        </GridItem>
      ) : null}
      {stage === 2 ? <Devices level={clickedLevel} /> : null}
    </div>
  );
}
