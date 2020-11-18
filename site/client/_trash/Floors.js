import React, { Component } from "react";
import axios from "axios";
import background from "assets/img/trianglify-lowres.png";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Icon from "@material-ui/core/Icon";
import GroupsTable from "components/Data/GroupsTable.js";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardBody from "@material-ui/core/Card";
import EditLight from "components/Edit/EditLight.js";
import EditGroup from "components/Edit/EditGroup.js";

const textWhite = {
  color: "white",
};

// const capitalize = {
//   textTransform: "capitalize"
// };

const textAlign = {
  textAlign: "center",
};

const lightText = {
  fontWeight: "100",
  textDecoration: "none",
};

export default class GroupCard extends Component {
  state = {
    levels: [],
    groups: [],
    clickedId: "",
    renderCheck: false,
  };

  componentDidMount() {
    axios
      //route to lights of group id = this.state.rowId
      .get(global.BASE_URL + "/api/levels/", {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        this.setState(
          {
            levels: response.data,
          },
          console.log(this.state.levels)
        );
      });
  }

  handleClick = (value) => (event) => {
    this.setState({ clickedId: value }, () => {
      axios
        //route to lights of group id = this.state.rowId
        .get(
          "http://" +
            global.BASE_URL +
            "/api/groups/levels/" +
            this.state.clickedId,
          {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
              Authorization: "Bearer " + localStorage.usertoken,
            },
          }
        )
        .then((response) => {
          this.setState({
            groups: response.data,
          });
        });

      this.setState({ renderCheck: true });
    });
    console.log(this.state.clickedId);
  };

  render() {
    return (
      <GridContainer justify="center" style={textAlign}>
        <GridItem xs={12}>
          <h1 style={lightText}>Scottish Parliament</h1>
        </GridItem>

        {this.state.levels.map((item, index) => (
          <GridItem
            xs={12}
            sm={6}
            md={6}
            lg={3}
            key={index}
            style={(textWhite, textAlign)}
          >
            <Button
              style={{
                borderRadius: "2px",
                backgroundImage: `url(${background})`,
                backgroundSize: "cover",
                minHeight: "180px",
                width: "86%",
                margin: "20px",
                display: "inline",
                fontSize: "1.7em",
                fontWeight: "normal",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
              onClick={this.handleClick(item.id)}
            >
              <div style={textWhite}>{item.level}</div>
              <div>
                <Icon
                  style={{ fontSize: "4em", color: "white", opacity: "0.8" }}
                >
                  emoji_objects
                </Icon>
              </div>
              <div>
                <p style={{ color: "white", fontSize: "1.5em" }}>
                  {item.locations}
                </p>
              </div>
            </Button>
          </GridItem>
        ))}
      </GridContainer>
    );
  }
}
