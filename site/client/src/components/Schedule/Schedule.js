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
import MaterialTable from "material-table";
import Buildings from "components/SiteSetup/Buildings";
import Levels from "components/SiteSetup/Levels";
import DateTime from "components/Schedule/DateTime";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import ChooseType from "components/Test/ChooseTestType";

// function NoDataIndication() {
//   return (
//     <div>
//       <Typography variant="h3">
//         <Skeleton />
//         <Skeleton />
//         <Skeleton />
//       </Typography>
//     </div>
//   );
// }

export default function Schedule() {
  const [sites, setSites] = React.useState([]);
  const [buildings, setBuildings] = React.useState([]);
  const [levels, setLevels] = React.useState([]);
  const [devices, setDevices] = React.useState([]);

  const [clickedSite, setClickedSite] = React.useState(null);
  //eslint-disable-next-line
  const [siteName, setSiteName] = React.useState("");
  const [stage, setStage] = React.useState(1);
  const [backDisabled, setBackDisabled] = React.useState(true);
  const [tabsDisabled, setTabsDisabled] = React.useState(true);
  const [clickedLevel, setClickedLevel] = React.useState(null);
  const [clickedBuilding, setClickedBuilding] = React.useState(null);
  const [clickedGroup, setClickedGroup] = React.useState(null);
  const [date, setDate] = React.useState(new Date());
  const [schedulerOpen, setSchedulerOpen] = React.useState(false);
  const [selectedDevices, setSelectedDevices] = React.useState([]);
  const [type, setType] = React.useState("Monthly");

  //material table columns
  const columns = [
    {
      field: "buildings_id",
      title: "ID",
      hidden: true,
    },
    {
      field: "building",
      title: "Building",
    },
    {
      field: "address",
      title: "Address",
    },
    {
      field: "devices",
      title: "Luminaires count",
      editable: "never",
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
      setLevels([]);
      setDevices([]);
      callBuildings(site).then((res) => {
        setClickedSite(site);
        setTimeout(() => {
          setBuildings(res.data);
          setTabsDisabled(false);
        }, 500);
      });
    }
  };

  const handleClickBuilding = (event, rowData) => {
    const index = buildings.indexOf(rowData);
    const row = buildings[index];

    setStage(2);
    setLevels([]);
    setClickedBuilding(row.buildings_id);
    callLevels(row.buildings_id).then((res) => {
      setLevels(res.data);
      setBackDisabled(false);
    });
  };

  const handleClickLevel = (event, rowData) => {
    const index = levels.indexOf(rowData);
    const row = levels[index];
    setStage(3);
    setDevices([]);
    setClickedLevel(row.id);
    callDevices(row.id).then((res) => {
      console.log(res);
      setDevices(res.data);
      setBackDisabled(false);
    });
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
          callBuildings(sites_id).then((res) => {
            console.log(res);
            setBuildings(res.data);
            callLevels(sites_id).then((res) => setLevels(res.data));
          });
          setTabsDisabled(false);
        }
      });
  };
  const callBuildings = async (siteID) => {
    const data = await axios.get(
      global.BASE_URL + "/api/buildings/joinlevels/" + siteID,
      {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      }
    );

    return data;
  };

  const callLevels = async (buildingID) => {
    const data = await axios.get(
      global.BASE_URL + "/api/levels/building/" + buildingID,
      {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      }
    );

    return data;
  };

  const callDevices = async (levelID) => {
    const data = await axios.get(
      global.BASE_URL + "/api/lights/level/" + levelID,
      {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      }
    );

    return data;
  };

  const handleScheduleTest = (levels) => {
    setSchedulerOpen(true);

    let devices_id = [];
    let finished = 0;
    //user id, date, device_ids, test_type

    levels.forEach((el) => {
      callDevices(el.id).then((res) => {
        res.data.forEach((d) => devices_id.push(d.id));
        console.log(res.data);
        finished++;
        if (finished === levels.length) {
          setSelectedDevices(devices_id);
        }
      });
    });
  };

  const changeType = (e) => {
    setType(e.target.value);
  };

  const scheduleTest = () => {};

  useEffect(() => {
    callSites();
    // eslint-disable-next-line
  }, []);

  const handleClickRow = (row) => {
    setStage(2);
    setClickedLevel(row.id);
    callDevices(row.id).then((res) => {
      setDevices(res.data);
    });
  };

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      console.log(row);
      setClickedBuilding(row.buildings_id);
      handleClickRow(row);
      if (stage >= 1) setBackDisabled(false);
    },
  };

  const expandRow = {
    renderer: (row) => {
      let data = [];
      const levelColumns = [
        {
          dataField: "id",
          text: "ID",
          hidden: true,
          sort: true,
        },
        {
          dataField: "level",
          text: "Level",
          sort: true,
        },
        {
          dataField: "devices",
          text: "Luminaires",
          sort: true,
          editable: false,
        },
        {
          dataField: "lights_count",
          text: "Luminaires count",
          sort: true,
          editable: false,
        },
      ];
      levels.forEach((el) => {
        if (row.buildings_id === el.buildings_id) data.push(el);
      });

      return (
        <div>
          <BootstrapTable
            keyField="id"
            data={data}
            rowEvents={rowEvents}
            columns={levelColumns}
            rowStyle={{ cursor: "pointer" }}
          />
        </div>
      );
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
              setBackDisabled(false);
            } else setBackDisabled(true);
            // if (stage >= 0) {
            //   setStage(stage - 1);
            //   if (stage === 0) setBackDisabled(true);
            //   else setBackDisabled(false);
            // } else setBackDisabled(true);
          }}
        >
          <Icon style={{ transform: "rotate(-90deg)" }}>navigation</Icon>
        </Fab>
      </GridItem>
      {/* {stage === 1 ? (
        <ToolkitProvider
          keyField="buildings_id"
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
                expandRow={expandRow}
                noDataIndication={() => <NoDataIndication />}
                hover
                rowStyle={{ cursor: "pointer" }}
              />
            </div>
          )}
        </ToolkitProvider>
      ) : null} */}
      {stage === 1 ? (
        <Buildings
          buildings={buildings}
          handleClickBuilding={handleClickBuilding}
          clickedBuilding={clickedBuilding}
          handleEditBuilding={() => {}}
          clickedSite={clickedSite}
          editable={false}
        />
      ) : null}
      {stage === 2 ? (
        <div>
          {schedulerOpen ? (
            <Card>
              <CardBody>
                <div style={{ display: "inline-block" }}>
                  <ChooseType handleChange={changeType} value={type} />
                </div>
                <div style={{ margin: "15px", display: "inline-block" }}>
                  <DateTime />
                </div>
              </CardBody>
            </Card>
          ) : null}
          <Levels
            levels={levels}
            callLevels={callLevels}
            handleClickLevel={handleClickLevel}
            clickedLevel={clickedLevel}
            handleEditLevel={() => {}}
            clickedBuilding={clickedBuilding}
            handleSchedule={handleScheduleTest}
            editable={false}
          />
        </div>
      ) : null}
      {stage === 3 && clickedLevel ? (
        <Devices level={clickedLevel} devices={devices} editable={false} />
      ) : null}
    </div>
  );
}
