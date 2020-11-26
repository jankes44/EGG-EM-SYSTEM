import React, {Component} from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import {Type} from "react-bootstrap-table2-editor";
import BootstrapTable from "react-bootstrap-table-next";
import Icon from "@material-ui/core/Icon";
import moment from "moment";
import TrialTestsTable from "components/Data/TrialTestsTable";
import paginationFactory from "react-bootstrap-table2-paginator";
import cellEditFactory from "react-bootstrap-table2-editor";
import Fab from "@material-ui/core/Fab";
import Button from "@material-ui/core/Button";
import CircularProgressWithLabel from "components/CircularProgress/CircularProgress";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/styles/withStyles";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import LiveFloorplanWrapper from "components/Test/LiveFloorplanWrapper";
import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import ChooseType from "components/Test/ChooseTestType";

const styles = {
  root: {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    border: 0,
    borderRadius: 3,
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    color: "white",
    height: 48,
    padding: "0 30px",
  },
  container: {
    marginTop: 50,
  },
};

const NoDataIndication = () => (
  <div
    className="spinner-grow text-info"
    style={{width: "6rem", height: "6rem"}}
  ></div>
);

class TrialTest extends Component {
  timer = 0;
  state = {
    message: "",
    gwMessage: "",
    errorMessage: "",
    input: "",
    isTest: true,
    testCounter: null,
    step: 1,
    userInput: "",
    disabledBackBtn: true,
    disabledFinish: true,
    disabledStartAll: true,
    disabledApply: true,
    disabledAbort: false,
    finishClicked: true,
    abortClicked: false,
    clickedStartAll: true,
    testFinished: false,
    testid: null,
    testData: [],
    selectedAction: "",
    sites: [],
    clickedSite: null,
    testType: "Monthly",
    resultBat: [],
    resultLamp: [],
    devices: [],
    deviceColumns: [
      {
        dataField: "id",
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
        editor: {
          type: Type.SELECT,
          options: [
            {value: "EX-58", label: "EX-58"},
            {value: "SA-25E", label: "SA-25E"},
            {value: "F-51E", label: "F-51E"},
          ],
        },
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
        editor: {
          type: Type.SELECT,
          getOptions: (setOptions, {row, column}) => {
            return this.state.selectOptions;
          },
        },
        formatter: (cellContent, row, rowIndex) => {
          return <span>{`${row.building} - ${row.level} level`}</span>;
        },
      },
      {
        dataField: "level",
        text: "",
        sort: true,
        hidden: true,
        editor: {
          type: Type.SELECT,
          getOptions: (setOptions, {row, column}) => {
            return this.state.selectOptions;
          },
        },
      },
      {
        dataField: "building",
        text: "",
        sort: true,
        hidden: true,
        editor: {
          type: Type.SELECT,
          getOptions: (setOptions, {row, column}) => {
            return this.state.selectOptions;
          },
        },
      },
      {
        dataField: "node_id",
        text: "BMesh Address",
        sort: true,
      },
    ],
    devicesFiltered: [],
    selectedDevices: [],
    selectedDevicesLive: [],
    selectedDevicesCols: [
      {
        dataField: "id",
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
        editor: {
          type: Type.SELECT,
          options: [
            {value: "EX-58", label: "EX-58"},
            {value: "SA-25E", label: "SA-25E"},
            {value: "F-51E", label: "F-51E"},
          ],
        },
      },
      {
        dataField: "group_name",
        text: "Location",
        sort: true,
        editor: {
          type: Type.SELECT,
          getOptions: (setOptions, {row, column}) => {
            return this.state.selectOptions;
          },
        },
        formatter: (cellContent, row, rowIndex) => {
          return <span>{`${row.building} - ${row.level} level`}</span>;
        },
      },
      {
        dataField: "level",
        text: "",
        sort: true,
        hidden: true,
        editor: {
          type: Type.SELECT,
          getOptions: (setOptions, {row, column}) => {
            return this.state.selectOptions;
          },
        },
      },
      {
        dataField: "building",
        text: "",
        sort: true,
        hidden: true,
        editor: {
          type: Type.SELECT,
          getOptions: (setOptions, {row, column}) => {
            return this.state.selectOptions;
          },
        },
      },
      {
        dataField: "node_id",
        text: "BMesh Address",
        sort: true,
      },
      // {
      //   dataField: "id",
      //   text: "",
      //   editable: false,
      //   headerStyle: (colum, colIndex) => {
      //     return { width: "80px", textAlign: "center" };
      //   },
      //   formatter: (cellContent, row, rowIndex) => {
      //     return (
      //       <IconButton color="secondary" onClick={() => console.log(row)}>
      //         <Icon style={{ fontSize: "1.2em" }}>delete</Icon>
      //       </IconButton>
      //     );
      //   },
      // },
    ],
    liveDevices: [],
    testColumns: [
      {
        dataField: "deviceId",
        text: "Record ID",
        sort: true,
        hidden: true,
      },
      {
        dataField: "device_id",
        text: "Device ID",
        sort: true,
        editable: false,
      },
      {
        dataField: "type",
        text: "Type",
        sort: true,
        editable: false,
      },
      {
        dataField: "level",
        text: "Location",
        sort: true,
        editable: false,
        formatter: (cellContent, row, rowIndex) => {
          return <span>{`${row.building} - level ${row.level}`}</span>;
        },
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
        editable: false,
        headerStyle: (colum, colIndex) => {
          return {width: "100px"};
        },
      },
      {
        dataField: "powercut",
        text: "powercut",
        sort: true,
        hidden: true,
      },
      {
        dataField: "duration",
        text: "Time left",
        sort: true,
        hidden: true,
      },
      {
        dataField: "",
        text: "Progress",
        editable: false,
        align: "center",
        headerStyle: (colum, colIndex) => {
          return {width: "10vw", textAlign: "center"};
        },
        formatter: (cellContent, row, rowIndex) => {
          if (row.powercut === 0) return <span>Awaiting Start</span>;
          if (row.duration > 0 && row.powercut === 1) {
            var duration = moment.duration(row.duration);
            var percentage = ((row.duration / row.durationStart) * 100).toFixed(
              0
            );
            var progress = 100 - percentage;

            return (
              <CircularProgressWithLabel value={progress} duration={duration} />
            );
          }
          if (row.duration === 0 && row.powercut === 1) {
            return <div>Awaiting finish</div>;
          }
          if (row.powercut === 2) {
            return <span style={{textAlign: "center"}}>Power back on</span>;
          }
          if (row.powercut === 3) {
            return null;
          }
        },
      },
      {
        dataField: "_",
        text: "Device state",
        editable: false,
        align: "center",
        headerStyle: (colum, colIndex) => {
          return {textAlign: "center"};
        },
        formatter: (cellContent, row) => {
          return (
            <div>
              {row.result}
              {/* {row.powercut === 0
                ? "Ready"
                : row.result.length
                ? Array.from(row.result).join(", ")
                : null} */}
            </div>
          );
        },
      },
      {
        dataField: "hasSensors",
        text: "Battery",
        editable: (cell, row, rowIndex, colIndex) => {
          return !row.hasSensors;
        },
        editor: {
          type: Type.SELECT,
          options: [
            {
              value: "OK",
              label: "OK",
            },
            {
              value: "Battery fault",
              label: "Battery fault",
            },
            {
              value: "Battery disconnected",
              label: "Battery disconnected",
            },
          ],
        },
        formatter: (cellContent, row) => {
          if (
            row.result.includes("Battery Fault") ||
            row.result.includes("Battery disconnected")
          ) {
            return <span>Faulty</span>;
          } else if (row.powercut !== 3 && row.powercut > 0)
            return <span>OK</span>;
          else return null;
        },
      },
      {
        dataField: "is_assigned",
        text: "Lamp",
        editable: (cell, row, rowIndex, colIndex) => {
          return !row.hasSensors;
        },
        editor: {
          type: Type.SELECT,
          options: [
            {
              value: "OK",
              label: "OK",
            },
            {
              value: "Lamp fault",
              label: "Lamp fault",
            },
          ],
        },
        formatter: (cellContent, row) => {
          if (row.result.includes("Lamp Fault")) {
            return <span>Faulty</span>;
          } else if (row.powercut !== 3 && row.powercut > 0)
            return <span>OK</span>;
          else return null;
        },
      },
      {
        dataField: "mesh",
        text: "Bluetooth mesh",
        editable: false,
        formatter: (cellContent, row) => {
          const result = row.result.length
            ? Array.from(row.result).join(",")
            : "";
          return result.includes("mesh") ? (
            <span>Connection problem</span>
          ) : (
            <span>OK</span>
          );
        },
      },
      {
        dataField: "clicked",
        text: "",
        hidden: true,
      },
      {
        dataField: "actions",
        text: "",
        align: "center",
        editable: false,
        formatter: (cellContent, row) => {
          var disabled = false;
          if (row.powercut > 0 || row.clicked > 0) disabled = true;
          if (this.state.testData.cut_all_clicked === 1) disabled = true;
          return (
            <Button
              color="primary"
              disabled={disabled}
              onClick={() => {
                this.cutPowerSingle(row.id);
              }}
            >
              Start em test
            </Button>
          );
        },
      },
    ],
    trialTests: [],
  };

  testInfo = (user, site) => {
    this.timer = setInterval(() => {
      if (this.state.testFinished === true)
        setTimeout(() => {
          clearInterval(this.timer);
        }, 2000);
      if (global.intervalCheck === true) {
        axios({
          //Axios GET request
          method: "get",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
          url: global.BASE_URL + "/mqtt/testinfo/" + `${user}/${site}`,
        }).then((res) => {
          if (res.data) {
            this.setState({
              testid: res.data.testId,
              testData: res.data,
            });
            this.setState(
              {
                liveDevices: res.data.devices,
              },
              () => {
                console.log(this.state.liveDevices);
                var userInput = this.state.liveDevices.every((el) => {
                  if (el.powercut > 0 || !this.state.finishClicked) {
                    return true;
                  } else return false;
                });

                if (!this.state.testData.finish_clicked === 0)
                  this.setState({finishClicked: false});

                // if (
                //   !userInput ||
                //   (this.state.testData.finish_clicked === 1 &&
                //     this.state.finishClicked)
                // ) {
                //   this.setState({ disabledFinish: true });
                // } else this.setState({ disabledFinish: false });

                if (res.data.abort_clicked === 1) {
                  this.setState({disabledAbort: true});
                } else if (
                  res.data.abort_clicked === 0 &&
                  !this.state.abortClicked
                ) {
                  this.setState({disabledAbort: false});
                }

                if (res.data.cut_all_clicked === 1) {
                  this.setState({disabledStartAll: true});
                } else
                  this.setState({
                    disabledStartAll: false,
                    clickedStartAll: false,
                  });
              }
            );
          } else this.setState({liveDevices: []});
        });
      } else clearInterval(this.timer);
    }, 1000);
  };

  componentDidMount() {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded.id;

    setTimeout(() => {
      this.setState({disabledFinish: false, finishClicked: false});
    }, 240000);

    axios({
      //TODO THIS FUNCTION GOES TO HANDLECHANGESITE TO CHECK IF THERE IS A TEST ON A SITE
      //Axios GET request
      method: "get",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url:
        global.BASE_URL +
        "/mqtt/testinfo/" +
        `${user}/${this.state.clickedSite}`,
    }).then((res) => {
      if (res.data.length) {
        // console.log(res.data[0].hasAccess, res.data[0].isTest, res.data[1]);
        if (res.data[0].hasAccess && !res.data[0].isTest) {
          this.setState({step: 1});
        }
        if (res.data[0].hasAccess && res.data[0].isTest) {
          this.setState({step: 3});
          this.testInfo(user);
        }
        if (!res.data[0].hasAccess && res.data[0].isTest) {
          this.setState({step: 20});
        }
        if (res.data) {
          if (res.data[1].length > 0) {
            console.log(res.data[1].test_id);
            this.setState({
              testid: res.data[1].test_id,
            });
          }
          this.setState({
            testCounter: res.data.testCounter,
            liveDevices: res.data[1].devices,
          });
        }
      }
    });

    axios({
      //Axios GET request
      method: "get",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/trialtests/usr/" + user,
    }).then((res) => {
      this.setState({
        trialTests: res.data,
      });
    });

    axios({
      //Axios GET request
      method: "get",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/lights/" + user,
    }).then((res) => {
      this.setState({devices: res.data}, () => this.callSites());
    });
  }

  handleStart = () => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded.id;
    const devices = this.state.selectedDevices.map((el) => el.id);
    console.log(devices);
    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url:
        global.BASE_URL +
        "/mqtt/trialteststart/" +
        `${user}/${this.state.clickedSite}`,
      data: {
        //data object sent in request's body
        message: this.state.step,
        devices: devices,
        user: user,
        test_type: this.state.testType,
        site_id: this.state.clickedSite,
      },
    })
      .then((res) => {
        this.setState(
          {
            message: res.data,
            step: 3,
            disabledBackBtn: true,
            testFinished: false,
          },
          () => {
            this.testInfo(user, this.state.clickedSite);
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  cutPowerSingle = (device) => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded.id;

    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/mqtt/cutpowersingle",
      data: {
        //data object sent in request's body
        device: device,
        user: user,
        site: this.state.clickedSite
      },
      timeout: 0,
    })
      .then((res) => {
        this.setState({message: res.data, step: 3});
      })
      .catch((error) => {
        console.log(error.response);
        this.setState({errorMessage: error.response.data});
      });
  };

  cutPowerAll = () => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded.id;
    console.log(this.state.clickedSite, user);
    this.setState({
      disabledStartAll: true,
      clickedStartAll: true,
    });
    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/mqtt/cutpowerall",
      data: {
        //data object sent in request's body
        user: user,
        site: this.state.clickedSite,
      },
      timeout: 0,
    })
      .then((res) => {
        this.setState({step: 3});
      })
      .catch((error) => {
        console.log(error.response);
        this.setState({errorMessage: error.response.data});
      });
  };

  userInput = (deviceId, input) => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded.id;

    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/mqtt/manualset/",
      data: {
        //data object sent in request's body
        result: input,
        user: user,
        device: deviceId,
      },
    })
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error.response);
      });
  };

  handleInputChange = (e) => {
    this.setState({});
  };

  saveTest = () => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded.id;
    this.setState({
      message: "Saving...",
      disabledFinish: true,
      finishClicked: true,
      abortClicked: true,
    });
    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/mqtt/savetest/" + `${user}/${this.state.clickedSite}`,
      timeout: 0,
    })
      .then((res) => {
        this.setState({message: res.data, step: 4, disabledBackBtn: false});
        this.setState({selectedDevicesLive: [], selectedDevices: []});
        axios({
          //Axios GET request
          method: "get",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
          url: global.BASE_URL + "/api/trialtests/usr/" + user,
        }).then((res) => {
          this.setState({
            trialTests: res.data,
            testFinished: true,
            clickedStartAll: false,
            disabledStartAll: false,
            finishClicked: false,
            abortClicked: false,
          });
        });
      })
      .catch((error) => {
        console.log(error.response);
        this.setState({errorMessage: error.response.data});
      });
  };

  abortTest = () => {
    if (window.confirm("Are you sure you want to abort?")) {
      const token = localStorage.usertoken;
      const decoded = jwt_decode(token);
      const user = decoded.id;
      this.setState({
        message: "Cancelling...",
        disabledFinish: true,
        finishClicked: true,
        disabledAbort: true,
        abortClicked: true,
      });
      axios({
        //Axios POST request
        method: "post",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
        url: global.BASE_URL + "/mqtt/aborttest/" + this.state.testid,
        timeout: 0,
        data: {user: user, topic: this.state.liveDevices[0].mqtt_topic},
      })
        .then((res) => {
          console.log(res);
          this.setState({selectedDevicesLive: [], selectedDevices: []});
          axios({
            //Axios GET request
            method: "get",
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
              Authorization: "Bearer " + localStorage.usertoken,
            },
            url: global.BASE_URL + "/api/trialtests/usr/" + user,
          }).then((res) => {
            this.setState({
              trialTests: res.data,
              testFinished: true,
            });
          });
          this.setState({message: res.data, step: 4, disabledBackBtn: false});
        })
        .catch((error) => {
          console.log(error.response);
          this.setState({errorMessage: error.response.data});
        });
    }
  };

  goToStepTwo = () => {
    if (this.state.selectedDevices.length) {
      this.setState({step: 2, errorMessage: "", disabledBackBtn: false});
    } else alert("You have to select devices to proceed");
  };

  handleSelect = (event) => {
    this.setState(
      {
        selectedAction: event.target.value,
      },
      () => {
        if (this.state.selectedAction !== "") {
          this.setState({disabledApply: false});
        }
      }
    );
  };

  callSites = () => {
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
          this.setState(
            {
              sites: response.data,
              clickedSite: response.data[0].sites_id,
              siteName: response.data[0].name,
            },
            () => {
              this.setState({
                devicesFiltered: this.state.devices.filter((light) => {
                  if (light.sites_id === this.state.sites[0].sites_id) {
                    return light;
                  } else {
                    return null;
                  }
                }),
              });
            }
          );
        }
      });
  };

  handleChangeSite = (event, site) => {
    if (this.state.sites.find((x) => x.sites_id === site)) {
      setTimeout(() => {
        this.setState({step: 1});
      }, 1);
      this.setState({
        selectedDevices: [],
        siteName: this.state.sites.find((x) => x.sites_id === site).name,
        clickedSite: site,
        devicesFiltered: this.state.devices.filter((light) => {
          if (light.sites_id === site) {
            return light;
          } else {
            return null;
          }
        }),
      });

      const token = localStorage.usertoken;
      const decoded = jwt_decode(token);
      const user = decoded.id;

      axios({
        //Axios GET request
        method: "get",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
        url: global.BASE_URL + "/mqtt/testinfo/" + `${user}/${site}`,
      }).then((res) => {
        console.log(res.data);

        if (res.data) {
          console.log(res.data);
          if (res.data.userId === user && res.data.siteId === site) {
            console.log(1);
            this.setState({step: 3});
            this.testInfo(user, site);
          }

          // console.log(res.data[0].hasAccess, res.data[0].isTest, res.data[1]);
          if (res.data.userId !== user || !res.data.inProgress) {
            console.log(2);
            this.setState({step: 1});
          }
          // if (res.data[0].hasAccess && res.data[0].isTest) {
          //   this.setState({step: 3});
          //   this.testInfo(user, site);
          // }
          // if (!res.data[0].hasAccess && res.data[0].isTest) {
          //   this.setState({step: 20});
          // }
          // if (res.data) {
          //   if (res.data[1].length > 0) {
          //     console.log(res.data[1].test_id);
          //     this.setState({
          //       testid: res.data[1].test_id,
          //     });
          //   }
          //   this.setState({
          //     testCounter: res.data.testCounter,
          //     liveDevices: res.data[1].devices,
          //   });
          // }
        }
      });
    }
  };

  handleChangeType = (e) => {
    this.setState({testType: e.target.value});
  };

  handleSelectAction = () => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded.id;
    if (this.state.selectedDevicesLive.length > 0) {
      axios({
        //Axios POST request
        method: "post",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
        url: global.BASE_URL + "/mqtt/setchecked",
        data: {
          devices: this.state.selectedDevicesLive,
          value: this.state.selectedAction,
          user: user,
        },
      })
        .then((res) => {
          console.log(res);
          this.setState({selectedDevicesLive: []});
        })
        .catch((error) => {
          console.log(error.response);
          this.setState({errorMessage: error.response.data});
        });
    }
  };

  handleChangeBatRes = (e) => {
    this.setState({resultBat: e.target.value});
    console.log(this.state.resultBat);
  };

  handleChangeLampRes = (e) => {
    this.setState({resultLamp: [...this.state.resultLamp, e.target.value]});
  };

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  clearSelected = () => {
    this.setState({selectedDevices: []});
  };

  render() {
    const selectRow = {
      mode: "checkbox",
      clickToSelect: true,
      onSelect: (row, isSelect, rowIndex, e) => {
        if (isSelect) {
          this.setState((prevState) => ({
            selectedDevices: [...prevState.selectedDevices, row],
          }));
        }
        if (!isSelect) {
          this.setState({
            selectedDevices: this.state.selectedDevices.filter((el) => {
              if (el.id !== row.id) {
                return el;
              } else return null;
            }),
          });
        }
      },
      onSelectAll: (isSelect, rows, e) => {
        if (isSelect) {
          this.setState({selectedDevices: rows});
        }
        if (!isSelect) {
          this.setState({selectedDevices: []});
        }
      },
    };

    const selectRowLiveDevices = {
      mode: "checkbox",
      clickToSelect: true,
      clickToEdit: true,
      onSelect: (row, isSelect, rowIndex) => {
        if (isSelect) {
          this.setState((prevState) => ({
            selectedDevicesLive: [...prevState.selectedDevicesLive, row],
          }));
        }
        if (!isSelect) {
          this.setState({
            selectedDevicesLive: this.state.selectedDevicesLive.filter((el) => {
              if (el.id !== row.id) {
                return el;
              } else return null;
            }),
          });
        }
      },
      onSelectAll: (isSelect, rows, e) => {
        if (isSelect) {
          this.setState({selectedDevicesLive: rows});
        }
        if (!isSelect) {
          this.setState({selectedDevicesLive: []});
        }
      },
    };

    const rowStyle = (row, rowIndex) => {
      const style = {};
      if (row.powercut === 3) {
        style.backgroundColor = "salmon";
      }
      if (row.powercut === 1) {
        style.backgroundColor = "lightblue";
      }
      if (row.duration === 0) {
        style.backgroundColor = "lightgreen";
      }
      return style;
    };

    // const options = {
    //   sizePerPageList: [
    //     {
    //       text: "5",
    //       value: 5,
    //     },
    //     {
    //       text: "10",
    //       value: 10,
    //     },
    //     {
    //       text: "All",
    //       value: this.state.devices.length,
    //     },
    //   ],
    // };

    const optionsSelected = {
      sizePerPageList: [
        {
          text: "5",
          value: 5,
        },
        {
          text: "10",
          value: 10,
        },
        {
          text: "All",
          value: this.state.selectedDevices.length,
        },
      ],
    };

    const afterSaveCell = (oldValue, newValue, row, column) => {
      console.log(row.id, newValue);
      if (newValue !== oldValue) this.userInput(row.id, newValue);
    };

    const {classes} = this.props;

    return (
      <div>
        <GridContainer justify="center">
          <GridItem xs={6} md={10}>
            {this.state.sites && this.state.step !== 3 ? (
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
                {this.state.sites.map((a, index) => (
                  <Tab key={index} value={a.sites_id} label={a.name} />
                ))}
              </Tabs>
            ) : null}
          </GridItem>
        </GridContainer>
        {this.state.step === 1 ? (
          <Fab
            style={{marginBottom: "15px"}}
            onClick={() => {
              this.setState({step: this.state.step - 1});
              if (this.state.step < 3) this.setState({selectedDevices: []});
            }}
            disabled={true}
          >
            <Icon style={{transform: "rotate(-90deg)"}}>navigation</Icon>
          </Fab>
        ) : null}
        {this.state.step !== 1 && this.state.step !== 20 ? (
          <Fab
            color="primary"
            disabled={this.state.disabledBackBtn}
            onClick={() => {
              this.setState({step: this.state.step - 1});
              if (this.state.step < 3) this.setState({selectedDevices: []});
              if (this.state.step === 4) this.setState({step: 1});
            }}
          >
            <Icon style={{transform: "rotate(-90deg)"}}>navigation</Icon>
          </Fab>
        ) : null}
        {/* Step 1 - choose devices */}
        {this.state.step === 1 ? (
          <div>
            <ChooseType
              handleChange={this.handleChangeType}
              value={this.state.testType}
            />
            <Typography variant="h6" gutterBottom>
              Select devices
            </Typography>
            <BootstrapTable
              noDataIndication={"no results found"}
              bordered={true}
              hover
              keyField="id"
              data={this.state.devicesFiltered}
              columns={this.state.deviceColumns}
              selectRow={selectRow}
            />

            <Button
              variant="contained"
              color="primary"
              style={{float: "right"}}
              onClick={this.goToStepTwo}
            >
              Next
            </Button>
          </div>
        ) : null}
        {/* step 2 - show devices selected */}
        {this.state.step === 2 ? (
          <div>
            <Typography variant="h4" gutterBottom>
              {/* {this.state.errorMessage} */}
            </Typography>
            <Typography variant="h4" gutterBottom>
              Devices selected
            </Typography>
            <BootstrapTable
              noDataIndication={"no results found"}
              bordered={true}
              hover
              keyField="id"
              data={this.state.selectedDevices}
              columns={this.state.selectedDevicesCols}
              pagination={paginationFactory(optionsSelected)}
            />
            <Button
              variant="contained"
              color="primary"
              style={{float: "right"}}
              onClick={this.handleStart}
            >
              start
            </Button>
          </div>
        ) : null}
        {/* step 3 - live devices and interface to start the test */}
        {this.state.step === 3 ? (
          <div>
            <Typography variant="h4" gutterBottom>
              {this.state.message}
            </Typography>
            <div style={{float: "right"}}>
              <Button
                // disabled={this.state.disabledStartAll}
                color="primary"
                onClick={this.cutPowerAll}
              >
                Start EM test
              </Button>
              <Button
                color="primary"
                disabled={false}
                onClick={this.saveTest}
              >
                finish & save
              </Button>
              <Button
                color="secondary"
                disabled={this.state.disabledAbort}
                onClick={this.abortTest}
              >
                Abort
              </Button>
            </div>
            <BootstrapTable
              noDataIndication={() => <NoDataIndication />}
              bordered={true}
              hover
              keyField="id"
              data={this.state.liveDevices}
              columns={this.state.testColumns}
              rowStyle={rowStyle}
              selectRow={selectRowLiveDevices}
              cellEdit={cellEditFactory({
                mode: "click",
                afterSaveCell: afterSaveCell,
                blurToSave: true,
                nonEditableRows: () => {
                  const devices = this.state.liveDevices;
                  let array = [];
                  devices.forEach((el) => {
                    if (el.has_sensors) array.push(el.id);
                  });
                  return array;
                },
              })}
            />
            <InputLabel>Actions</InputLabel>
            <Select
              style={{minWidth: "200px"}}
              onChange={this.handleSelect}
              value={this.state.selectedAction}
            >
              <MenuItem value={"OK"}>Set 'Battery OK'</MenuItem>
              <MenuItem value={"OK"}>Set 'Lamp OK'</MenuItem>
              <MenuItem value={"Lamp Fault"}>Set 'Lamp fault'</MenuItem>
              <MenuItem value={"Battery Fault"}>Set 'Battery fault'</MenuItem>
            </Select>
            <Button
              disabled={this.state.disabledApply}
              color="primary"
              onClick={() => {}}
            >
              Apply
            </Button>
          </div>
        ) : null}
        {this.state.step === 4 ? (
          <div>
            <Typography variant="h4" gutterBottom>
              {this.state.message}
            </Typography>
            <TrialTestsTable
              justFinishedTest={true}
              lastTest={this.state.testid}
              tests={this.state.trialTests}
            />
          </div>
        ) : null}
        {this.state.step === 20 ? (
          <Typography variant="h4" gutterBottom>
            Site test in progress. Please come back later.
          </Typography>
        ) : null}
        {this.state.step !== 1 && this.state.step !== 20 ? (
          <div className={classes.container}>
            {this.state.liveDevices.length > 0 ? (
              <LiveFloorplanWrapper liveDevices={this.state.liveDevices} />
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
}

export default withStyles(styles)(TrialTest);
