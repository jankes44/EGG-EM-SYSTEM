import React from "react";
import axios from "axios";
import GridItem from "components/Grid/GridItem.js";
import Icon from "@material-ui/core/Icon";
import GroupsTable from "components/Data/GroupsTable.js";
import Button from "@material-ui/core/Button";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardFooter from "components/Card/CardFooter.js";
import { makeStyles } from "@material-ui/core/styles";

const NoDataIndication = () => (
  <div
    className="spinner-grow text-info"
    style={{ width: "6rem", height: "6rem" }}
  ></div>
);

const useStyles = makeStyles({
  root: {
    backgroundColor: "transparent",
    boxShadow: "none",
    paddingTop: "0px",
    padding: "20px",
    marginBottom: "0px",
  },
  "@keyframes opacity": {
    "100%": { opacity: 1 },
  },
  modalRoot: {
    background: "rgba(255,255,255,0)",
  },
  buildingStyle: {
    transition: "0.3s",
    "&:hover": {
      transition: "0.3s",
      backgroundColor: "#e8e8e8",
    },
    cursor: "pointer",
    backgroundColor: "white",
  },
  crumbleNavigation: {
    transition: "0.3s",
    "&:hover": {
      transition: "0.3s",
      color: "black",
      textDecoration: "underline",
      cursor: "pointer",
    },
  },
  tableFadeIn: {
    opacity: "0",
    margin: "15px",
    animationName: "$opacity",
    animationDuration: "0.3s",
    animationTimingFunction: "linear",
    animationFillMode: "forwards",
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontWeight: "400",
      lineHeight: "1",
    },
  },
  paper: {
    position: "absolute",
    maxWidth: "485px",
    backgroundColor: "white",
    boxShadow: "5px 5px 3px #333333",
    padding: "20px",
  },
});

export default function Building(props) {
  const classes = useStyles();
  const [buildings, setBuildings] = React.useState([]);
  React.useEffect(() => {
    axios
      .get(global.BASE_URL + "/api/buildings/" + props.clickedSite, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.usertoken,
        },
      })
      .then((response) => {
        setBuildings(response.data);
      });
  }, [props.clickedSite]);
  if (buildings.length)
    return (
      <div>
        {buildings.map((el) => (
          <GridItem xs={12} sm={12} md={6} key={el.id}>
            <Card
              onClick={(e) => console.log(el.id)}
              className={classes.buildingStyle}
            >
              <CardBody color="success">
                <CardIcon color="success">
                  <Icon>check</Icon>
                </CardIcon>
                <p className={classes.cardCategory}>Building</p>
                <h3 className={classes.cardTitle}>{el.building}</h3>
              </CardBody>
              <CardFooter stats>
                <div className={classes.stats}>Footer</div>
              </CardFooter>
            </Card>
          </GridItem>
        ))}
      </div>
    );
  else return <NoDataIndication />;
}
