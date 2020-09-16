import React from "react";
// import Console from "components/Console/Console.js";
import Button from "@material-ui/core/Button";
import axios from "axios";
// import TestsTable from "components/Data/TestsTable.js";
// import SnackBar from "../Data/SnackBar.js";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import table from "./table.css";
import GroupRenderer from "./GroupRenderer";
import background from "assets/img/trianglify-lowres.png";
import { IconButton } from "@material-ui/core";
import Icon from "@material-ui/core/Icon";
import Snackbar from "components/Snackbar/Snackbar";
import jwt_decode from "jwt-decode";
// import MqttContainer from "components/MqttContainer/MqttContainer.js";

const butStyle = {
  background:
    "linear-gradient(90deg, rgba(41,214,148,1) 0%, rgba(39,198,210,1) 100%)",
  color: "white",
  width: "auto",
  height: "35px",
  marginRight: "5px",
};

const selectStyle = {
  width: "150px",
  height: "auto",
  marginBottom: "20px",
  color: "white",
};

const config = {
  headers: { Authorization: "Bearer " + localStorage.usertoken },
};

class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      id: "",
      description: "",
      device: [],
      lightDevices: [],
      value: "",
      lgt_groups_id: null,
      info: "",
      lights: [],
      lightCount: null,
      result: "",
      failed: null,
      content: "",
      isDisabled: false,
      selectedOption: null,
      node: "",
      devices: [],
      groups: [],
      selectedGroups: [],
      deviceInfo: "",
      showSnackbar: false,
    };
  }

  getDate = () => {
    let date = Date.now();
    this.setState({ date });
  };

  timeoutState = () => {
    this.setState({ isActive: true });
  };

  componentDidMount() {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const user = decoded.id;

    axios
      .get(global.BASE_URL + "/api/lights/" + user, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.setState({
          devices: response.data,
        });
      });

    axios
      .get(global.BASE_URL + "/api/groups/groupslevel/" + user, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.setState({
          groups: response.data,
        });
      });
    axios
      .get(global.BASE_URL + "/api/lights/" + user, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.setState({
          lightDevices: response.data,
        });
      });
  }

  getOutput = () => {
    fetch(global.BASE_URL + "/api/tests", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.usertoken,
      },
    })
      .then((results) => results.json())
      .then((data) => this.setState({ tests: data }))
      .catch(function(error) {
        console.log(error);
      });
  };

  nodeSelect = (event) => {
    this.setState({ node: event.target.value });
  };

  handleSelect = (event) => {
    this.setState({
      selectedGroups: event.target.value,
    });
  };

  handleChange = (event) => {
    this.setState({ value: event.target.value });
  };

  handleChangeLight = (event) => {
    this.setState({
      id: event.target.value,
      deviceInfo: this.state.lightDevices.find(
        (x) => x.id === event.target.value
      ),
    });

    // this.setState(select{ id: event.target.value }, console.log(this.state.select.id));
  };

  closeSnackbar = (stateObject, setStateObject, time) => {
    if (stateObject === true) {
      setTimeout(() => {
        this.setState({ [setStateObject]: !stateObject });
      }, time);
    }
  };

  //GET state from each light given on the endpoint (this endpoint outputs all nodes from database)
  getState = () => {
    fetch(global.BASE_URL + "/api/lights/nodes/" + this.state.group, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.usertoken,
      },
    })
      .then((results) => results.json())
      .then((data) =>
        this.setState({ devices: data }, () => {
          axios({
            method: "post",
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
              Authorization: "Bearer " + localStorage.usertoken,
            },
            url: global.BASE_URL + "/mqtt/status",
            data: {
              message: this.state.devices, //message sent in body object to backend - test 000X node
            },
            config,
          });
        })
      )
      .catch(function(error) {
        console.log(error);
      });
  };

  deviceTest = () => {
    if (
      window.confirm(
        `Start a test on device: ${this.state.deviceInfo.device_id} ${this.state.deviceInfo.type} location: ${this.state.deviceInfo.group_name}`
      )
    ) {
      this.setState({ isDisabled: true, showSnackbarTest: true });
      //fetch array of nodes from DB
      fetch(global.BASE_URL + "/api/lights/id/" + this.state.id, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
        .then((results) => results.json())
        .then((data) =>
          this.setState({ device: data }, () => {
            axios({
              method: "post",
              headers: {
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: "Bearer " + localStorage.usertoken,
              },
              url: global.BASE_URL + "/mqtt/test",
              data: {
                message: this.state.device, //message sent in body object to backend - test 000X node
                light: this.state.id,
              },
              config,
            });
          })
        )
        .catch(function(error) {
          console.log(error);
        });
    } else {
      window.alert("Cancelled.");
    }
  };

  //POST a test command with param - group_id which passes an array of node_id's from lights table in DB
  groupTest = () => {
    if (
      window.confirm(
        `Start a test on selected locations? Test will start immediately`
      )
    ) {
      this.setState({ isDisabled: true, showSnackbarTest: true });
      //fetch array of nodes from DB
      axios
        .post(
          global.BASE_URL + "/api/lights/groups",
          this.state.selectedGroups,
          {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
              Authorization: "Bearer " + localStorage.usertoken,
            },
          }
        )
        .then((response) =>
          this.setState({ devices: response.data }, () => {
            axios({
              method: "post",
              headers: {
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: "Bearer " + localStorage.usertoken,
              },
              url: global.BASE_URL + "/mqtt/grouptest",
              data: {
                message: this.state.devices, //message sent in body object to backend - test 000X node
                group: this.state.selectedGroups,
              },
              config,
            });
          })
        )
        .catch(function(error) {
          console.log(error);
        });
    }
  };

  handleDeleteSelected = (value) => {
    this.setState({
      selectedGroups: this.state.selectedGroups.filter((group) => {
        if (group !== value) {
          return group;
        } else return null;
      }),
    });
  };

  clearSelect = () => {
    this.setState({
      selectedGroups: [],
      disabled: true,
    });
  };

  render() {
    this.closeSnackbar(this.state.showSnackbarTest, "showSnackbarTest", 6000);
    const deviceInfo = this.state.deviceInfo;
    return (
      <div>
        <div>
          <div className="container mx-auto">
            <div className="row justify-content-center text-center">
              <div
                className="col-sm jumbotron"
                style={{
                  color: "white",
                  borderRadius: "2px",
                  border: "1pt solid whitesmoke",
                  backgroundImage: `url(${background})`,
                  backgroundSize: "cover",
                  fontSize: "1.4em",
                  fontWeight: "normal",
                }}
              >
                <div>
                  <h4>Select locations</h4>
                  <Select
                    style={selectStyle}
                    onChange={this.handleSelect}
                    value={this.state.selectedGroups}
                    multiple
                  >
                    {this.state.groups.map((item, index) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.level} level - {item.group_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {this.state.selectedGroups.length ? (
                    <IconButton
                      onClick={() => this.setState({ selectedGroups: [] })}
                      color="primary"
                    >
                      <Icon>delete</Icon>
                    </IconButton>
                  ) : null}
                </div>
                <div className="text-left">
                  {this.state.selectedGroups.length ? (
                    <GroupRenderer
                      selected={this.state.selectedGroups}
                      groups={this.state.groups}
                      testColor="white"
                      bgColour="transparent"
                      handleDeleteSelected={this.handleDeleteSelected}
                      clearSelect={this.clearSelect}
                    />
                  ) : null}
                </div>
                <Button
                  variant="contained"
                  onClick={this.groupTest}
                  style={butStyle}
                  disabled={this.state.isDisabled}
                >
                  Start
                </Button>
              </div>
              <div
                className="col-sm jumbotron"
                style={{
                  color: "white",
                  borderRadius: "2px",
                  border: "1pt solid whitesmoke",
                  backgroundImage: `url(${background})`,
                  backgroundSize: "cover",
                  fontSize: "1.4em",
                  fontWeight: "normal",
                }}
              >
                <div>
                  <h4>Select device</h4>
                  <Select
                    style={selectStyle}
                    label="Light ID"
                    id="id"
                    value={this.state.id}
                    onChange={this.handleChangeLight}
                  >
                    {this.state.lightDevices.map((item, index) => (
                      <MenuItem key={index} value={item.id}>
                        {item.device_id} - {item.type}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
                {this.state.deviceInfo ? (
                  <div>
                    <table className="blueTable">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Type</th>
                          <th>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{deviceInfo.device_id}</td>
                          <td>{deviceInfo.type}</td>
                          <td>{deviceInfo.group_name}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : null}
                <Button
                  variant="contained"
                  onClick={this.deviceTest}
                  style={butStyle}
                  disabled={this.state.isDisabled}
                >
                  Start
                </Button>
                <Snackbar
                  message={"Test initiating..."}
                  close
                  color="info"
                  place={"bl"}
                  open={this.state.showSnackbarTest}
                  closeNotification={() =>
                    this.setState({ showSnackbarTest: false })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Test;
