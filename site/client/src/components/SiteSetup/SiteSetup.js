import { Fab, Icon, Tab, Tabs, Tooltip } from "@material-ui/core";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Buildings from "components/SiteSetup/Buildings";
import Devices from "components/SiteSetup/Devices";
import Levels from "components/SiteSetup/Levels";
import NewBuilding from "components/SiteSetup/NewBuilding";
import NewLevel from "components/SiteSetup/NewLevel";
import jwt_decode from "jwt-decode";
import React from "react";

export default class SiteSetup extends React.Component {
  state = {
    sites: [],
    buildings: [],
    levels: [],
    devices: [],
    siteName: "",
    stage: 1,
    backDisabled: true,
    tabsDisabled: true,
    clickedGroup: null,
    clickedLevel: null,
    clickedLevelDetails: {},
    clickedBuilding: null,
    clickedBuildingDetails: {},
    clickedSite: null,
    createNewBuilding: false,
    createNewLevel: false,
    buildingName: "",
    buildingAddress: "",
    levelName: "",
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

  saveNewBuilding = () => {
    axios({
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/buildings/new-empty",
      data: {
        building_name: this.state.buildingName,
        sites_id: this.state.clickedSite,
        address: this.state.buildingAddress,
      },
    }).then((res) => {
      this.refresh().then(() => this.setState({ createNewBuilding: false }));
      console.log(res);
    });
  };

  saveNewLevel = () => {
    axios({
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/levels",
      data: {
        buildings_id: this.state.clickedBuilding,
        level: this.state.levelName,
      },
    }).then((res) => {
      this.refresh().then(() => this.setState({ createNewLevel: false }));
      console.log(res);
    });
  };

  handleNewBuilding = () => {
    this.setState({ createNewBuilding: !this.state.createNewBuilding });
  };

  handleNewLevel = () => {
    this.setState({ createNewLevel: !this.state.createNewLevel });
  };

  setBuildingName = (e) => {
    this.setState({ buildingName: e.target.value });
  };

  setBuildingAddress = (e) => {
    this.setState({ buildingAddress: e.target.value });
  };

  setLevelName = (e) => {
    this.setState({ levelName: e.target.value });
  };

  /* API CALLS */
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

  callLevels = async (buildingID) => {
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

  callDevices = async (levelID) => {
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

  /* HANDLERS */
  handleClickBuilding = (row) => {
    this.setState({
      stage: 2,
      clickedBuilding: row.buildings_id,
      clickedBuildingDetails: row,
    });
    this.callLevels(row.buildings_id).then((res) => {
      this.setState({ levels: res.data, backDisabled: false });
    });
  };

  handleClickLevel = (row) => {
    this.setState({ stage: 3, clickedLevel: row.id, clickedLevelDetails: row });
    this.callDevices(row.id).then((res) => {
      console.log(res);
      this.setState({ devices: res.data, backDisabled: false });
    });
  };

  handleEditLevel = (levelID, colName, newValue) => {
    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/levels/edit/" + parseInt(levelID),
      data: {
        colName: colName,
        level: newValue,
      },
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  refresh = async () => {
    let promise = new Promise((resolve, reject) => {
      this.callSites().then((res) => {
        const sites_id = res.data[0].sites_id;
        console.log(res);
        this.setState({
          sites: res.data,
          clickedSite: sites_id,
          siteName: res.data[0].name,
        });
        this.callBuildings(sites_id).then((res) => {
          console.log(res);
          this.setState({ buildings: res.data });
        });
        this.callLevels(sites_id).then((res) => {
          this.setState({ levels: res.data });
          resolve("");
        });
        this.setState({ tabsDisabled: false });
      });
    });
    let result = await promise;
    return result;
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

  render() {
    // const expandRow = {
    //   renderer: (row) => {
    //     let data = [];
    //     const levelColumns = [
    //       {
    //         dataField: "id",
    //         text: "ID",
    //         hidden: true,
    //         sort: true,
    //       },
    //       {
    //         dataField: "level",
    //         text: "Level",
    //         sort: true,
    //       },
    //       {
    //         dataField: "devices",
    //         text: "Luminaires",
    //         sort: true,
    //         editable: false,
    //       },
    //       {
    //         dataField: "lights_count",
    //         text: "Luminaires count",
    //         sort: true,
    //         editable: false,
    //       },
    //     ];
    //     levels.forEach((el) => {
    //       if (row.buildings_id === el.buildings_id) data.push(el);
    //     });

    //     return (
    //       <div>
    //         <GridItem xs={1} style={{ marginBottom: "10px" }}>
    //           {clickedSite ? (
    //             <NewLevel
    //               handleNewLevel={this.handleNewLevel}
    //               building={row.buildings_id}
    //               clickedSite={clickedSite}
    //               data={data}
    //             />
    //           ) : null}
    //         </GridItem>
    //         <BootstrapTable
    //           keyField="id"
    //           data={data}
    //           columns={levelColumns}
    //           cellEdit={cellEditFactory({
    //             mode: "click",
    //             beforeSaveCell: (oldValue, newValue, row, column) => {
    //               console.log("Before Saving Cell!!");
    //             },
    //             afterSaveCell: (oldValue, newValue, row, column) => {
    //               this.handleEditLevel(row.id, column.dataField, newValue);
    //             },
    //           })}
    //           ref={(n) => {
    //             this.bootstrapTableRef = n;
    //           }}
    //         />
    //       </div>
    //     );
    //   },
    // };

    const {
      clickedSite,
      backDisabled,
      stage,
      createNewBuilding,
      createNewLevel,
      buildings,
      clickedLevel,
      clickedBuilding,
      sites,
      levels,
      devices,
    } = this.state;

    return (
      <div style={{ margin: "5px" }}>
        {/* TABS */}
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

        {/* BACK BUTTON */}
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
                      if (this.state.stage > 1) {
                        this.setState({ stage: stage - 1 }, () => {
                          if (this.state.stage <= 1)
                            this.setState({ backDisabled: true });
                          else this.setState({ backDisabled: false });
                        });
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
            {stage === 2 ? (
              <GridItem xs={1}>
                <Tooltip title="Add a level" aria-label="add a level">
                  <Fab color="primary" onClick={this.handleNewLevel}>
                    <Icon>add</Icon>
                    lvl
                  </Fab>
                </Tooltip>
              </GridItem>
            ) : null}
            {stage === 3 ? (
              <GridItem xs={1}>
                <Tooltip title="Add devices" aria-label="add devices">
                  <Fab color="primary" onClick={this.handleNewBuilding}>
                    <Icon>add</Icon>
                    <Icon style={{ fontSize: "1.5em" }}>emoji_objects</Icon>
                  </Fab>
                </Tooltip>
              </GridItem>
            ) : null}
          </GridContainer>
        </div>
        <GridContainer
          justify="center"
          style={{ margin: "5px", textAlign: "center" }}
        >
          {/* TABS */}
          <GridItem xs={12}>
            {stage > 1 ? (
              <div>
                <h4>{this.state.clickedBuildingDetails.building}</h4>
                {stage > 2 ? (
                  <h5>Level {this.state.clickedLevelDetails.level}</h5>
                ) : (
                  <div style={{ height: "50px" }}></div>
                )}
              </div>
            ) : (
              <div style={{ height: "50px" }}></div>
            )}
          </GridItem>
        </GridContainer>
        {stage === 1 ? (
          <GridItem xs={12}>
            <Buildings
              buildings={buildings}
              handleClickBuilding={this.handleClickBuilding}
              clickedBuilding={clickedBuilding}
            />
            {createNewBuilding ? (
              <div style={{ marginLeft: "15px", marginRight: "15px" }}>
                <NewBuilding
                  setBuildingName={this.setBuildingName}
                  clickedSite={clickedSite}
                  saveNewBuilding={this.saveNewBuilding}
                  setBuildingAddress={this.setBuildingAddress}
                />
              </div>
            ) : null}
          </GridItem>
        ) : null}
        {stage === 2 ? (
          <GridItem xs={12}>
            <Levels
              levels={levels}
              callLevels={this.callLevels}
              handleClickLevel={this.handleClickLevel}
              clickedLevel={clickedLevel}
            />
            {createNewLevel ? (
              <div style={{ marginLeft: "15px", marginRight: "15px" }}>
                <NewLevel
                  setLevelName={this.setLevelName}
                  clickedBuilding={clickedBuilding}
                  saveNewLevel={this.saveNewLevel}
                />
              </div>
            ) : null}
          </GridItem>
        ) : null}
        {stage === 3 ? (
          devices.length > 0 ? (
            <Devices level={clickedLevel} devices={devices} />
          ) : (
            <h4 style={{ color: "#0F1C23" }}>No devices? Add them!</h4>
          )
        ) : null}
      </div>
    );
  }
}
