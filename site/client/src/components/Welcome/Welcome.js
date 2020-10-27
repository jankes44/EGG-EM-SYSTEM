import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardBody.js";
import CardIcon from "components/Card/CardIcon.js";
import CardFooter from "components/Card/CardFooter.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Icon from "@material-ui/core/Icon";
import jwt_decode from "jwt-decode";
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import axios from "axios";
import moment from "moment";

const useStyles = makeStyles(styles);

const lightText = {
  fontWeight: "100",
  textDecoration: "none",
};
let newDate = "";

export default function Welcome(props) {
  const [firstName, setFirstName] = useState("");
  const [lastTest, setLastTest] = useState({});
  const [cardColor] = useState("success");
  const [gwState, setGwState] = useState("...");
  const [stateColor, setStateColor] = useState("black");
  const [date] = useState(
    new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")
  );

  useEffect(() => {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);

    setFirstName(decoded.first_name);

    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/mqtt/dev/gateway/state",
      data: {
        topic: global.SEND_TOPIC,
      },
      timeout: 0,
    })
      .then((res) => {
        console.log(res);
        if (res.data.includes("STATE_OK")) {
          setGwState("✅");
          setStateColor("green");
        } else {
          setStateColor("red");
          setGwState("❌");
        }
      })
      .catch((error) => {
        console.log(error);
      });

    axios
      .get(global.BASE_URL + "/api/tests/lasttest/" + decoded.id, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        newDate = moment(response.data.created_at)
          .add(30, "days")
          ._d.toISOString()
          .slice(0, 19)
          .replace("T", " ");
        setLastTest({
          id: response.data.id,
          created_at: response.data.created_at,
          building: response.data.building,
        });
      });
  }, []);

  const classes = useStyles();

  const location = {
    pathname: "/admin/test",
    state: { fromDashboard: true, lastTest: lastTest.id },
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={lightText}>Welcome {firstName}</h1>

      <GridContainer justify="center" style={{ textAlign: "right" }}>
        <GridItem xs={12} sm={6}>
          <Card>
            <CardHeader color={cardColor}>
              <CardIcon color={cardColor}>
                {newDate > date ? <Icon>check</Icon> : <Icon>warning</Icon>}
              </CardIcon>
              <h3 className={classes.cardTitle}>Scottish Parliament</h3>
              <p className={classes.cardCategory}>Last Test</p>
              <h3 className={classes.cardTitle}>
                {lastTest.building} -{" "}
                {moment(lastTest.created_at).format("DD.MM.YYYY")}
              </h3>
              <h4 className={classes.cardTitle}>
                Site connection status:{" "}
                <p
                  style={{
                    display: "inline-block",
                    fontWeight: "bolder",
                    color: stateColor,
                  }}
                >
                  {gwState}
                </p>
              </h4>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Link to={location}>Show me the latest test</Link>
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
      {/* <GridContainer justify="center">
        <GridItem xs={12} sm={6} md={4} lg={3}>
          <Link to="/admin/management" style={delDecor}>
            <Card style={cardStyle}>
              <CardBody style={whiteTxt}>
                <h1 style={lightText}>Your site</h1>
                <LocationCityIcon style={{ fontSize: 75 }} />
              </CardBody>
            </Card>
          </Link>
        </GridItem>
        <GridItem xs={12} sm={6} md={4} lg={3}>
          <Link to="/admin/test" style={delDecor}>
            <Card style={cardStyle}>
              <CardBody style={whiteTxt}>
                <h1 style={lightText}>Test</h1>
                <Icon style={{ fontSize: 75 }}>content_paste</Icon>
              </CardBody>
            </Card>
          </Link>
        </GridItem>
      </GridContainer> */}
    </div>
  );
}
