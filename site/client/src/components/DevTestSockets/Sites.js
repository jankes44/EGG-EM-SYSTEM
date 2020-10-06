import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import PropTypes from "prop-types";
import Building from "components/DevTestSockets/Building";

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

  React.useEffect(() => {
    if (props.sites.length) setClickedSite(props.sites[0].sites_id);
  }, [props.sites]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setClickedSite(props.sites[newValue].sites_id);
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
          <Tab key={index} label={el.name} {...a11yProps(index)} />
        ))}
      </Tabs>
      {props.sites.map((el, index) => (
        <TabPanel key={index} value={value} index={index}>
          <Building clickedSite={clickedSite} />
        </TabPanel>
      ))}
      {/* <TabPanel value={value} index={0}>
        Item One
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
      <TabPanel value={value} index={3}>
        Item Four
      </TabPanel> */}
    </Paper>
  );
}
