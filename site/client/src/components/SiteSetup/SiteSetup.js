import React, { useState, useEffect, useRef } from "react";
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
import NewLevel from "components/SiteSetup/NewLevel";
import cellEditFactory from "react-bootstrap-table2-editor";
import LevelsTable from "components/SiteSetup/LevelsTable";
// import "./workAround/index.css";

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

export default class SiteSetup extends React.Component {
  // const [sites, setSites] = useState([]);
  // const [buildings, setBuildings] = useState([]);
  // const [levels, setLevels] = useState([]);
  // const [siteName, setSiteName] = React.useState("");
  // const [stage, setStage] = React.useState(1);
  // const [backDisabled, setBackDisabled] = React.useState(true);
  // const [tabsDisabled, setTabsDisabled] = React.useState(true);
  // const [clickedGroup, setClickedGroup] = React.useState(null);
  // const [clickedLevel, setClickedLevel] = React.useState(null);
  // const [clickedBuilding, setClickedBuilding] = React.useState(null);
  // const [clickedSite, setClickedSite] = useState(null);
  // const [createNewBuilding, setCreateNewBuilding] = useState(false);

  // let bootstrapTableRef;

  state = {
    sites: [],
    buildings: [],
    levels: [],
    siteName: "",
    stage: 1,
    backDisabled: true,
    tabsDisabled: true,
    clickedGroup: null,
    clickedLevel: null,
    clickedBuilding: null,
    clickedSite: null,
    createNewBuilding: false,
  };
  //{clickedSite, tabsDisabled, backDisabled, stage, createNewBuilding, buildings}

  handleChangeSite = (event, site) => {
    if (
      this.state.sites.find((x) => x.sites_id === site) &&
      this.state.clickedSite !== site
    ) {
      this.setState({
        tabsDisabled: true,
        stage: 1,
        buildings: [],
      });
      this.callBuildings(site).then((res) => {
        this.setState({ clickedSite: site });
        setTimeout(() => {
          this.setState({
            buildings: res.data,
            tabsDisabled: false,
          });
        }, 500);
      });
    }
  };

  handleNewBuilding = () => {
    this.setState({ createNewBuilding: !this.state.createNewBuilding });
  };

  handleNewLevel = (building, site, data) => {
    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/levels",
      data: {
        buildings_id: building,
      },
    })
      .then((response) => {
        this.setState(
          {
            levels: [
              ...this.state.levels,
              {
                buildings_id: building,
                devices: "",
                floorplan: null,
                group_id: null,
                group_name: "",
                id: site,
                level: "No name",
                lights_count: 0,
              },
            ],
          },
          () => {
            this.bootstrapTableRef.cellEditContext.startEditing(data.length, 0);
          }
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // const handleEditLevel = (levelID) => {
  //   axios({
  //     //Axios POST request
  //     method: "post",
  //     headers: {
  //       "Content-Type": "application/json;charset=UTF-8",
  //       Authorization: "Bearer " + localStorage.usertoken,
  //     },
  //     url: global.BASE_URL + "/api/levels/edit/" + parseInt(levelID),
  //     data: {
  //       colName: colName,
  //       level: newValue,
  //     },
  //   });
  // };

  callSites = async () => {
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

  callBuildings = async (siteID) => {
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

  callLevels = async (siteID) => {
    const data = await axios.get(
      global.BASE_URL + "/api/levels/site/" + siteID,
      {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      }
    );

    return data;
  };

  handleClickRow = (row) => {
    this.setState({ stage: 2, clickedLevel: row.levels_id });
  };

  componentDidMount() {
    this.callSites().then((res) => {
      const sites_id = res.data[0].sites_id;
      this.setState({
        sites: res.data,
        clickedSite: sites_id,
        siteName: res.data[0].name,
      });
      this.callBuildings(sites_id).then((res) => {
        this.setState({ buildings: res.data });
      });
      this.callLevels(sites_id).then((res) => {
        this.setState({ levels: res.data });
      });
      this.setState({ tabsDisabled: false });
    });
  }

  // useEffect(() => {
  //   callSites().then((res) => {
  //     const sites_id = res.data[0].sites_id;
  //     setSites(res.data);
  //     setClickedSite(sites_id);
  //     setSiteName(res.data[0].name);
  //     callBuildings(sites_id).then((res) => {
  //       setBuildings(res.data);
  //     });
  //     callLevels(sites_id).then((res) => {
  //       console.log(res.data);
  //       setLevels(res.data);
  //     });
  //     setTabsDisabled(false);
  //   });
  // }, []);

  render() {
    const { SearchBar } = Search;
    const columns = [
      {
        dataField: "buildings_id",
        text: "ID",
        hidden: true,
      },
      {
        dataField: "building",
        text: "Building",
      },
      {
        dataField: "levels",
        text: "Levels",
      },
      {
        dataField: "devices",
        text: "Luminaires count",
      },
    ];

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

        // const [sites, setSites] = useState([]);
        // const [buildings, setBuildings] = useState([]);
        // const [levels, setLevels] = useState([]);
        // const [siteName, setSiteName] = React.useState("");
        // const [stage, setStage] = React.useState(1);
        // const [backDisabled, setBackDisabled] = React.useState(true);
        // const [tabsDisabled, setTabsDisabled] = React.useState(true);
        // const [clickedGroup, setClickedGroup] = React.useState(null);
        // const [clickedLevel, setClickedLevel] = React.useState(null);
        // const [clickedBuilding, setClickedBuilding] = React.useState(null);
        // const [clickedSite, setClickedSite] = useState(null);
        // const [createNewBuilding, setCreateNewBuilding] = useState(false);

        return (
          // <LevelsTable
          //   handleNewLevel={handleNewLevel}
          //   building={row.buildings_id}
          //   clickedSite={clickedSite}
          //   levelColumns={levelColumns}
          //   data={data}
          // />
          <div>
            <GridItem xs={1} style={{ marginBottom: "10px" }}>
              {clickedSite ? (
                <NewLevel
                  handleNewLevel={this.handleNewLevel}
                  building={row.buildings_id}
                  clickedSite={clickedSite}
                  data={data}
                />
              ) : null}
            </GridItem>
            <BootstrapTable
              keyField="id"
              data={data}
              columns={levelColumns}
              cellEdit={cellEditFactory({ mode: "click" })}
              ref={(n) => {
                this.bootstrapTableRef = n;
              }}
            />
          </div>
        );
      },
    };

    const {
      clickedSite,
      tabsDisabled,
      backDisabled,
      stage,
      createNewBuilding,
      buildings,
      clickedLevel,
      clickedBuilding,
      sites,
      levels,
      clickedGroup,
      siteName,
    } = this.state;

    return (
      <div style={{ margin: "5px" }}>
        <GridItem xs={12}>
          {this.state.clickedSite ? (
            <Tabs
              value={this.state.clickedSite}
              onChange={this.handleChangeSite}
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
                    disabled={this.state.tabsDisabled}
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
                        this.setState({ stage: stage - 1 });
                        if (stage > 1) this.setState({ backDisabled: true });
                        else this.setState({ backDisabled: false });
                      } else this.setState({ backDisabled: true });
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
                <Tooltip
                  title="Setup new building"
                  aria-label="add new building"
                >
                  <Fab color="primary" onClick={this.handleNewBuilding}>
                    <Icon>add</Icon>
                    <Icon style={{ fontSize: "1.5em" }}>apartment</Icon>
                  </Fab>
                </Tooltip>
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
              keyField="buildings_id"
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
}
