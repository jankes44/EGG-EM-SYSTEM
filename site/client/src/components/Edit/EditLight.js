import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import React from "react";

const divStyle = {
  margin: "25px",
};

const butStyle = {
  marginTop: "20px",
  marginLeft: "20px",
};

export default class EditLight extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      groups: [],
      lights: [],
      id: "",
      lgt_groups_id: "",
      device_id: "",
      type: "",
      node_id: "",
    };

    this.handleChange = this.handleChange.bind(this);
  }

  changeHandlerInt = (e) => {
    this.setState({
      [e.target.name]:
        e.target.type === "number" ? parseInt(e.target.value) : e.target.value,
    });
  };

  changeHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  editHandler = (e, props) => {
    e.preventDefault();
    console.log(this.state);
    axios
      .post(global.BASE_URL + "/api/lights/" + this.state.id, this.state, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
    this.props.callCount();
    this.props.callLights();
  };

  handleChangeLight = (event) => {
    this.setState({ id: event.target.value }, console.log(this.state.id));
  };

  handleChange = (event) => {
    this.setState(
      { lgt_groups_id: event.target.value },
      console.log(this.state.lgt_groups_id)
    );
  };

  componentDidMount() {
    axios
      .get(global.BASE_URL + "/api/lights", {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.setState({
          lights: response.data,
        });
      });
    axios
      .get(global.BASE_URL + "/api/groups/groupslevel", {
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
  }

  componentWillUnmount() {
    /*
       stop getData() from continuing to run even
       after unmounting this component. Notice we are calling
       'clearTimeout()` here rather than `clearInterval()` as
       in the previous example.
    */
    clearTimeout(this.intervalID);
  }

  render() {
    const { id, lgt_groups_id, device_id, type, node_id } = this.state;
    return (
      <div>
        <form onSubmit={this.editHandler} style={divStyle}>
          <div style={{ paddingBottom: "15px" }}>
            <InputLabel>Record ID</InputLabel>
            <Select
              style={{ width: "138px" }}
              label="Light ID"
              id="id"
              value={id}
              onChange={this.handleChangeLight}
            >
              {this.state.lights.map((item, index) => (
                <MenuItem key={index} value={item.id}>
                  {item.id}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div style={{ paddingBottom: "15px" }}>
            <InputLabel>Group</InputLabel>
            <Select
              style={{ width: "138px" }}
              label="Group ID"
              id="lgt_groups_id"
              value={lgt_groups_id}
              onChange={this.handleChange}
            >
              {this.state.groups.map((item, index) => (
                <MenuItem key={index} value={item.id}>
                  {item.level} level - {item.group_name}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div>
            <TextField
              label="Device ID"
              type="number"
              name="device_id"
              value={device_id}
              onChange={this.changeHandler}
            />
          </div>
          <div>
            <TextField
              label="Type"
              type="text"
              name="type"
              value={type}
              onChange={this.changeHandler}
            />
          </div>
          <div>
            <TextField
              label="BMesh Address"
              type="text"
              name="node_id"
              value={node_id}
              onChange={this.changeHandler}
            />
          </div>
          <Button
            onClick={this.timeOutButton}
            style={butStyle}
            variant="contained"
            color="primary"
            type="submit"
          >
            Submit
          </Button>
        </form>
      </div>
    );
  }
}
