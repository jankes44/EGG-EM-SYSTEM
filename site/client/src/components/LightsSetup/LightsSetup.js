import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import axios from "axios";
import Select from "react-select";

const butStyle = {
  background:
    "linear-gradient(90deg, rgba(41,214,148,1) 0%, rgba(39,198,210,1) 100%)",
  color: "white",
  width: "100px",
  height: "35px",
};

const formContainer = {
  display: "flex",
  justifyContent: "space-between",
  border: "1px solid whitesmoke",
  borderRadius: "3px",
  boxShadow: "0px 0px 4px -2px rgba(0,0,0,0.75)",
  padding: "10px",
  marginBottom: "20px",
};

export default class LightsSetup extends Component {
  state = {
    isDisabled: false,
    group_id: 1,
    description: "Description",
    value: 5,
  };

  interval = () => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      axios
        .post(global.BASE_URL + "/api/lights", this.state, {
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
      if (count >= this.state.value) clearInterval(interval);
    }, 0);
  };

  handleChange = (event) => {
    this.setState({ value: event.target.value });
  };

  handleSelect = (selectedOption) => {
    this.setState({ group_id: selectedOption.value });
    console.log(`Group selected:`, selectedOption.value);
  };

  render() {
    const options = [
      { value: 1, label: "Group 1" },
      { value: 2, label: "Group 2" },
      { value: 3, label: "Group 3" },
      { value: 4, label: "Group 4" },
    ];

    return (
      <div>
        <h4 style={{ fontWeight: "lighter" }}>Insert to group</h4>
        <div style={formContainer}>
          <input
            type="number"
            value={this.state.value}
            onChange={this.handleChange}
            style={{ width: "4vw", marginRight: "15px" }}
          />
          <Select
            style={{ zIndex: 10000 }}
            options={options}
            className="mt-0 col-sm-6 col-offset-4"
            onChange={this.handleSelect}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={this.interval}
            disabled={this.state.isDisabled}
            style={butStyle}
          >
            Insert
          </Button>
        </div>
      </div>
    );
  }
}
