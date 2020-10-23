import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import PropTypes from "prop-types";
import Building from "components/DevTestSockets/Building";
import axios from "axios";
import Devices from "components/DevTestSockets/SelectDevices";
import TestContainer from "components/DevTestSockets/TestContainer";
import Fab from "@material-ui/core/Fab";
import Icon from "@material-ui/core/Icon";
import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";

const useStyles = makeStyles({
  paperRoot: {
    backgroundColor: "whitesmoke",
    justifyContent: "center",
  },
  root: {
    flexGrow: 1,
  },
  root2: {
    justifyContent: "center",
  },
  scroller: {
    flexGrow: "0",
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`,
  };
}

export default function CenteredTabs(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [clickedSite, setClickedSite] = React.useState();
  //eslint-disable-next-line
  const [socket, setSocket] = React.useState();
  const [tabsDisabled, setTabsDisabled] = React.useState(false);
  const [liveDevices, setLiveDevices] = React.useState([]);
  const [stage, setStage] = React.useState(1);
  const [clickedBuilding, setClickedBldng] = React.useState();
  const [gwState, setGwState] = React.useState("Wait...");

  const checkStatus = (socketName) => {
    console.log("checkStatus of", socketName);
    axios({
      //Axios POST request
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/sockets/status",
      data: {
        socket: socketName,
      },
      timeout: 0,
    })
      .then((res) => {
        console.log(res);
        let gwStatus = res.data.message.gwStatus;
        let siteCheck = props.sites.find((el) => el.sites_id === clickedSite);

        if (gwStatus.includes("NO RESPONSE"))
          gwStatus = `${gwStatus} - Please contact the administrator`;
        console.log(clickedSite);
        if (siteCheck.socket_name === socketName) setGwState(gwStatus);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  React.useEffect(() => {
    if (props.sites.length > 0) {
      const socket = props.sites[0].socket_name;
      setClickedSite(props.sites[0].sites_id);
      setSocket(socket);
      checkStatus(socket);
    }
    // eslint-disable-next-line
  }, [props.sites]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setClickedSite(props.sites[newValue].sites_id);
    console.log(props.sites);
    setSocket(props.sites[newValue].socket_name);
    checkStatus(props.sites[newValue].socket_name);
    setGwState("Wait...");
    setStage(1);
  };

  const toggleTabs = () => {
    setTabsDisabled(!tabsDisabled);
  };

  const initiateTest = (devices) => {
    setStage(3);
    console.log(devices);
    setLiveDevices(devices);
    toggleTabs();
  };

  const setClickedBuilding = (id) => {
    setClickedBldng(id);
    setStage(2);
    console.log(id);
  };

  return (
    <Paper className={classes.paperRoot}>
      <Tabs
        classes={{ root: classes.root2, scroller: classes.scroller }}
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        {props.sites.map((el, index) => (
          <Tab
            key={index}
            disabled={tabsDisabled}
            label={el.name}
            {...a11yProps(index)}
          />
        ))}
      </Tabs>
      {props.sites.length
        ? props.sites.map((el, index) => (
            <TabPanel key={index} value={value} index={index}>
              {stage === 1 ? (
                <div>
                  <GridContainer>
                    <GridItem xs={2}>
                      <Fab color="primary" disabled={true}>
                        <Icon>arrow_back</Icon>
                      </Fab>
                    </GridItem>
                    <GridItem xs={10} style={{ textAlign: "right" }}>
                      Gateway status: {gwState}
                    </GridItem>
                  </GridContainer>
                  <GridContainer justify="center">
                    <GridItem xs={12}>
                      <Building
                        clickedSite={clickedSite}
                        toggleTabs={toggleTabs}
                        initiateTest={initiateTest}
                        setClickedBuilding={setClickedBuilding}
                      />
                    </GridItem>
                  </GridContainer>
                </div>
              ) : null}
              {stage === 2 ? (
                <div>
                  <Fab color="primary" onClick={() => setStage(stage - 1)}>
                    <Icon>arrow_back</Icon>
                  </Fab>
                  <Devices
                    clickedBuilding={clickedBuilding}
                    initiate={initiateTest}
                  />
                </div>
              ) : null}
              {stage === 3 ? (
                <div>
                  <Fab color="primary" disabled={true}>
                    <Icon>arrow_back</Icon>
                  </Fab>
                  <TestContainer devices={liveDevices} />
                </div>
              ) : null}
            </TabPanel>
          ))
        : null}
    </Paper>
  );
}
