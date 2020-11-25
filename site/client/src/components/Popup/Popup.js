import React from "react";
import "./style.css";
import {Link} from "react-router-dom";
import {CSVLink} from "react-csv";
// import { PDFDownloadLink } from "@react-pdf/renderer";
// import { PdfDocument } from "./PdfTest";
import moment from "moment";
import Fade from "@material-ui/core/Fade";
import axios from "axios";
import {Checkbox, Icon} from "@material-ui/core";
import FillPDF from "components/Popup/FillPDF";

class Popup extends React.Component {
  state = {
    reportData: [],
    errorsCsv: [],
    renderPDF: false,
    documentGenerated: false,
  };

  generatePDF = () => {
    this.setState({documentGenerated: true});
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

  render() {
    const csvReportArray = this.props.errorsCsv;
    const tests = this.props.testsFiltered[0];
    const errors = this.props.errorsFiltered;
    let errorsArr = [];
    let errorsStr = "";
    if (tests && errors) {
      let successColor = "green";
      let successful = 0;
      errors.forEach((el) => {
        if (el.result === "OK") successful++;
        if (!el.result.includes("OK")) {
          const err = `${el.device_id} - ${el.type}: ${el.result}`;
          errorsArr.push(err);
        }
      });
      errorsStr = errorsArr.join(", ");

      if (successful !== tests.lights) successColor = "salmon";
      return (
        <Fade in={this.props.showPopup}>
          <div className="containerDetails">
            <div className="datagrid">
              <div style={{overflowX: "auto"}}>
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
                      <td style={{color: successColor}}>
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
                    <tr style={{textAlign: "left"}}>
                      <th></th>
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
                      return (
                        <tr key={index} style={{backgroundColor: color}}>
                          <td>
                            {!item.result.includes("OK") ? (
                              <Icon style={{color: "#FF786A"}}>cancel</Icon>
                            ) : (
                              <Icon style={{color: "#92d737"}}>
                                check_circle
                              </Icon>
                            )}
                          </td>
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
                          <td>
                            <Checkbox
                              inputProps={{
                                "aria-label": "uncontrolled-checkbox",
                              }}
                            />
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
              style={{marginTop: "20px"}}
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
            </div>
            <div
              className="btn-group"
              role="group"
              aria-label="CSV PDF buttons group"
              style={{marginTop: "20px", float: "right"}}
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
              <button className="btn btn-primary mt-3 mb-5">Retest all</button>
              <button className="btn btn-success mt-3 mb-5">
                Retest selected
              </button>
            </div>
            <FillPDF test={this.props.testsFiltered[0]} defects={errorsStr} />
          </div>
        </Fade>
      );
    } else return null;
  }
}

export default Popup;
