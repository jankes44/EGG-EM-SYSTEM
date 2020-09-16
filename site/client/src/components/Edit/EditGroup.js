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
      group_name: "",
      group_id: "",
      description: "",
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

  editHandler = (e) => {
    e.preventDefault();
    console.log(this.state);
    axios
      .post(
        "http://" +
          global.BASE_URL +
          "/api/groups/" +
          parseInt(this.state.group_id),
        this.state,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: "Bearer " + localStorage.usertoken,
          },
        }
      )
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  handleChange = (event) => {
    this.setState(
      { group_id: event.target.value },
      console.log(this.state.group_id)
    );
  };

  componentDidMount() {
    axios
      .get(global.BASE_URL + "/api/groups", {
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
    const { group_id, group_name, description } = this.state;
    return (
      <div>
        <form onSubmit={this.editHandler} style={divStyle}>
          <div style={{ paddingBottom: "5px" }}>
            <InputLabel>Group</InputLabel>
            <Select
              style={{ width: "138px" }}
              id="group_id"
              value={group_id}
              onChange={this.handleChange}
            >
              {this.state.groups.map((item, index) => (
                <MenuItem key={index} value={item.id}>
                  {item.group_name}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div>
            <TextField
              label="Name"
              type="text"
              name="group_name"
              value={group_name}
              onChange={this.changeHandler}
            />
            <p style={{ color: "gray", fontSize: "0.8em" }}>
              Leave empty for existing name
            </p>
          </div>
          <div>
            <TextField
              label="Description"
              type="text"
              name="description"
              value={description}
              onChange={this.changeHandler}
            />
            <p style={{ color: "gray", fontSize: "0.8em" }}>
              Leave empty for existing description
            </p>
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
