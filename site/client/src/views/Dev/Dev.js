// @material-ui/core components
// import { makeStyles } from "@material-ui/core/styles";
import GridContainer from "components/Grid/GridContainer.js";
// core components
import GridItem from "components/Grid/GridItem.js";
import React from "react";
// import MQTT from "components/MqttContainer/MqttContainer";
// import MovieList from "components/Pdf/MovieList";

// const styles = {
//   cardCategoryWhite: {
//     "&,& a,& a:hover,& a:focus": {
//       color: "rgba(255,255,255,.62)",
//       margin: "0",
//       fontSize: "14px",
//       marginTop: "0",
//       marginBottom: "0"
//     },
//     "& a,& a:hover,& a:focus": {
//       color: "#FFFFFF"
//     }
//   },
//   cardTitleWhite: {
//     color: "#FFFFFF",
//     marginTop: "0px",
//     minHeight: "auto",
//     fontWeight: "300",
//     fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
//     marginBottom: "3px",
//     textDecoration: "none",
//     "& small": {
//       color: "#777",
//       fontSize: "65%",
//       fontWeight: "400",
//       lineHeight: "1"
//     }
//   },
//   tableUpgradeWrapper: {
//     display: "block",
//     width: "100%",
//     overflowX: "auto",
//     WebkitOverflowScrolling: "touch",
//     MsOverflowStyle: "-ms-autohiding-scrollbar"
//   },
//   table: {
//     width: "100%",
//     maxWidth: "100%",
//     marginBottom: "1rem",
//     backgroundColor: "transparent",
//     borderCollapse: "collapse",
//     display: "table",
//     borderSpacing: "2px",
//     borderColor: "grey",
//     "& thdead tr th": {
//       fontSize: "1.063rem",
//       padding: "12px 8px",
//       verticalAlign: "middle",
//       fontWeight: "300",
//       borderTopWidth: "0",
//       borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
//       textAlign: "inherit"
//     },
//     "& tbody tr td": {
//       padding: "12px 8px",
//       verticalAlign: "middle",
//       borderTop: "1px solid rgba(0, 0, 0, 0.06)"
//     },
//     "& td, & th": {
//       display: "table-cell"
//     }
//   },
//   center: {
//     textAlign: "center"
//   }
// };

// const useStyles = makeStyles(styles);

export default function LgtManager() {
  // const classes = useStyles();
  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          {/* <MQTT /> */}
        </GridItem>
      </GridContainer>
    </div>
  );
}
