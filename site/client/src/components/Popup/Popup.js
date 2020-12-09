import React from "react";
import "./style.css";
import { Link } from "react-router-dom";
import { CSVLink } from "react-csv";
// import { PDFDownloadLink } from "@react-pdf/renderer";
// import { PdfDocument } from "./PdfTest";
import moment from "moment";
import Fade from "@material-ui/core/Fade";
import axios from "axios";

class Popup extends React.Component {
  state = {
    reportData: [],
    errorsCsv: [],
    renderPDF: false,
    documentGenerated: false,
  };

  generatePDF = () => {
    this.setState({ documentGenerated: true });
  };

  downloadReport = () => {
    const tests = this.props.testsFiltered[0];
    axios({
      url: global.BASE_URL + "/api/generatepdf/generateReport/" + tests.id,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      method: "GET",
      responseType: "blob", // important
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `test${moment(tests.created_at).format("YYYY-MM-DD-kmmss")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
    });
  };

  downloadOfficialReport = () => {
    const tests = this.props.testsFiltered[0];
    axios({
      url:
        global.BASE_URL + "/api/generatepdf/generateOfficialReport/" + tests.id,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      method: "GET",
      responseType: "blob", // important
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `test${moment(tests.created_at).format("YYYY-MM-DD-kmmss")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
    });
  };

  render() {
    const csvReportArray = this.props.errorsCsv;
    const tests = this.props.testsFiltered[0];
    const errors = this.props.errorsFiltered;

    if (tests && errors) {
      let successColor = "green";
      let successful = 0;
      errors.forEach((el) => {
        if (el.result === "OK") successful++;
      });
      if (successful !== tests.lights) successColor = "salmon";
      return (
        <Fade in={this.props.showPopup}>
          <div className="containerDetails">
            <div className="datagrid">
              <div style={{ overflowX: "auto" }}>
                <table>
                  <tbody>
                    <tr>
                      <th>Site</th>
                      <th>Tested Lights</th>
                      <th>Status</th>
                      {/* <th>Warnings</th> */}
                      <th>Type</th>
                      <th>Test Time</th>
                    </tr>
                    <tr>
                      <td>
                        {tests.site} - {tests.building}
                      </td>
                      <td style={{ color: successColor }}>
                        {successful}/{tests.lights}
                      </td>
                      <td>{tests.result}</td>
                      {/* <td>{tests.errors}</td> */}
                      <td>{tests.type}</td>
                      <td>
                        {moment(tests.created_at).format("k:mm DD.MM.YYYY")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="infoContainer">
                <table>
                  <tbody>
                    <tr style={{ textAlign: "left" }}>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Response</th>
                      {/* <th>Retest</th> */}
                    </tr>
                    {errors.map((item, index) => {
                      let color = "";
                      if (item.result) {
                        item.error = item.result;
                      }
                      if (item.result !== "OK") color = "salmon";
                      return (
                        <tr key={index} style={{ backgroundColor: color }}>
                          <td
                            style={{
                              fontWeight: "lighter",
                              fontSize: "1.3em",
                            }}
                          >
                            {item.device_id}
                          </td>
                          <td
                            style={{
                              fontWeight: "lighter",
                              fontSize: "1.3em",
                            }}
                          >
                            {item.type}
                          </td>
                          <td
                            style={{
                              fontWeight: "bold",
                              fontSize: "1.3em",
                            }}
                          >
                            {`${item.building} - level ${item.level}`}
                          </td>
                          <td
                            style={{
                              fontWeight: "lighter",
                              fontSize: "1.3em",
                            }}
                          >
                            {item.error}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {/* <ErrorsRender /> */}
            <div
              className="btn-group"
              role="group"
              aria-label="CSV PDF buttons group"
              style={{ marginTop: "20px" }}
            >
              {/* <CSVLink
                    data={csvReportArray}
                    target=""
                    className="btn btn-primary"
                  >
                    Download CSV
                  </CSVLink>

                  <button
                    onClick={this.downloadReport}
                    className="btn btn-success"
                  >
                    Download PDF
                  </button> */}
              <button
                onClick={this.downloadOfficialReport}
                className="btn btn-primary m-3 mb-5"
              >
                Download PDF
              </button>
            </div>
          </div>
        </Fade>
      );
    } else return null;
  }
}

export default Popup;
