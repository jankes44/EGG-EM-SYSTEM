import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    margin: 20,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  container: {
    display: "flex",
    flexDirection: "row",
    padding: 5,
    alignItems: "center",
    width: "93%",
  },

  movieDetails: {
    margin: 5,
    fontSize: 0,
    minWidth: 100,
  },
  subtitle: {
    fontSize: 8,
    width: "90%",
    marginLeft: 10,
  },
  topDetailsContainer: {
    minHeight: 126,
    backgroundColor: "whitesmoke",
    width: "45%",
    border: "1 solid black",
    marginLeft: "15px",
    fontSize: 10,
  },
  jobStatusContainer: {
    minHeight: 50,
    backgroundColor: "whitesmoke",
    width: "50%",
    borderRight: "1 solid black",
    fontSize: 10,
  },
  jobStatus: {
    borderBottom: "1 solid black",
    minHeight: "15px",
  },
  fullContainer: {
    minHeight: 100,
    backgroundColor: "whitesmoke",
    width: "92%",
    border: "1 solid black",
    marginLeft: "15px",
  },
  topDetails: {
    borderBottom: "1 solid black",
    minHeight: "15px",
  },
  faultRecordParagraphs: {
    minHeight: 35,
    borderBottom: "1 solid black",
  },
});

export function PdfDocument(props) {
  return (
    <Document>
      <Page style={styles.page}>
        {/* heading */}
        <View
          style={{
            backgroundColor: "#660066",
            display: "flex",
            flexDirection: "row",
            padding: 5,
            color: "white",
            width: "93%",
          }}
        >
          <Text>
            Emergency lighting - functional inspection & test certificate
          </Text>
        </View>
        <View style={styles.container}>
          <Text style={{ width: "50%" }}>Work order no:</Text>
          <Text style={{ width: "50%" }}>Certificate no:</Text>
        </View>
        <View style={{ marginBottom: "15px" }}>
          <Text style={styles.subtitle}>
            For systems designed to BS 5266-1:2016 and BS EN 50172:2004 / BS
            5266-8:2016 This certificate conforms to the appropriate
            recommendations given in BS 5266-1:2011, BS EN 1838:1999 and BE EN
            50172:2004
          </Text>
          <Text style={styles.subtitle}>
            WARNING Full duration tests involve discharging the batteries, so
            the emergency lighting system will not be fully functional until the
            batteries have had time to recharge. For this reason, always carry
            out testing at times of minimal risk, or only test alternate
            luminaires at any one time.
          </Text>
        </View>
        {/*Site details*/}
        <View style={styles.container}>
          <View style={styles.topDetailsContainer}>
            <Text style={styles.topDetails}>
              Site name:{props.testsData.site} - {props.testsData.building}
            </Text>
            <Text style={[styles.topDetails, { minHeight: 50 }]}>
              Site address:
            </Text>
            <Text style={styles.topDetails}>Site contact:</Text>
            <Text style={styles.topDetails}>Contact no: </Text>
            <Text style={[styles.topDetails, { borderBottom: "" }]}>
              Engineer name:
            </Text>
          </View>
          <View style={styles.topDetailsContainer}>
            <Text style={styles.topDetails}>System mode of operation:</Text>
            <Text style={styles.topDetails}>Further details:</Text>
            <Text style={styles.topDetails}>Duration of system (hours):</Text>
            <Text style={styles.topDetails}>
              Is an automatic test system fitted?: Yes
            </Text>
            <Text style={styles.topDetails}>
              System manufacturer: EggLighting
            </Text>
            <Text
              style={[styles.topDetails, { minHeight: 50, borderBottom: "" }]}
            >
              List all areas/devices tested:{" "}
              <Text>
                {props.testsData.level} level - {props.testsData.group_name}
                {"   "}
                {"  "}
              </Text>
              {props.errorsData.map((a, index) => {
                return (
                  <View key={index}>
                    <Text>
                      {a.device_id} - {a.type},{" "}
                    </Text>
                  </View>
                );
              })}
            </Text>
            <Text>{props.testsData.location}</Text>
          </View>
        </View>

        {/*Service details */}
        <View style={styles.container}>
          <View style={styles.fullContainer}>
            <Text
              style={{
                textAlign: "center",
                borderBottom: "1 solid black",
                fontSize: 14,
              }}
            >
              Service details
            </Text>
            <View style={{ fontSize: 11 }}>
              <View>
                <Text>Test types</Text>
              </View>
              <View>
                <Text>C = Commissioning and verification test</Text>
                <Text>
                  M = Monthly test (see BS EN 50172:2004 / BS 5266-8:2004,
                  7.2.3)
                </Text>
                <Text>
                  A = Annual test (see BS EN 50172:2004 / BS 5266-8:2004, 7.2.4)
                </Text>
              </View>
              <View style={[styles.container, { marginTop: 15 }]}>
                <Text style={{ width: "40%" }}>
                  Date of test:{" "}
                  {moment(props.testsData.created_at).format("DD.MM.YYYY")}
                </Text>
                <Text style={{ width: "40%" }}>Test type:</Text>
                <Text style={{ width: "40%" }}>Test result:</Text>
              </View>
            </View>
          </View>
        </View>
        {/*Fault action record*/}
        <View style={styles.container}>
          <View style={styles.fullContainer}>
            <Text
              style={{
                textAlign: "center",
                borderBottom: "1 solid black",
                fontSize: 14,
              }}
            >
              Fault action record
            </Text>
            <View style={{ fontSize: 11 }}>
              <View style={styles.faultRecordParagraphs}>
                <Text>List of any defects or variations: </Text>
                <Text
                  style={[
                    styles.topDetails,
                    { minHeight: 50, borderBottom: "" },
                  ]}
                >
                  {props.errorsData.map((a, index) => {
                    if (a.result !== "Device OK") {
                      return (
                        <View key={index}>
                          <Text>
                            {a.device_id} - {a.type} - {a.error},{" "}
                          </Text>
                        </View>
                      );
                    } else return null;
                  })}
                </Text>
              </View>
              <Text style={styles.faultRecordParagraphs}>
                Action taken to rectify the system:
              </Text>
              <Text style={styles.faultRecordParagraphs}>
                Remedial works required:
              </Text>
              <Text style={styles.faultRecordParagraphs}>
                Action taken to safeguard the premises (where applicable):
              </Text>
              <Text style={styles.faultRecordParagraphs}>
                Are any parts required? If so, detail requirements:
              </Text>
            </View>
          </View>
        </View>

        {/*Job status */}
        <View style={styles.container}>
          <View style={styles.fullContainer}>
            <Text
              style={{
                textAlign: "center",
                borderBottom: "1 solid black",
                fontSize: 14,
              }}
            >
              Job status
            </Text>
            <View
              style={{ fontSize: 11, display: "flex", flexDirection: "row" }}
            >
              <View style={styles.jobStatusContainer}>
                <Text style={styles.jobStatus}>
                  Test result satisfactory?{" "}
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>
                    {props.testsData.result === "Successful" && "Yes"}
                    {props.testsData.result === "Failed" && "No"}
                  </Text>
                </Text>
                <Text style={styles.jobStatus}>Engineer name:</Text>
                <Text style={{ minHeight: 1 }}>Engineer signature:</Text>
              </View>
              <View style={styles.jobStatusContainer}>
                <Text style={styles.jobStatus}>
                  Parts required?{" "}
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>
                    {props.testsData.result === "Successful" && "No"}
                    {props.testsData.result === "Failed" && "Yes"}
                  </Text>
                </Text>
                <Text style={styles.jobStatus}>Further visit?</Text>
                <Text style={styles.jobStatus}>Client name:</Text>
                <Text style={{ minHeight: 1 }}>Client signature:</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
