import React from "react";
import "./style.css";
import Icon from "@material-ui/core/Icon";
import { IconButton } from "@material-ui/core";
import { Link } from "react-router-dom";
import { CSVLink } from "react-csv";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PdfDocument } from "./PdfTest";
import moment from "moment";
import Fade from "@material-ui/core/Fade";

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

  render() {
    const csvReportArray = this.props.errorsCsv;
    const tests = this.props.testsFiltered[0];
    const errors = this.props.errorsFiltered;
    if (tests && errors) {
      var filename = `report${moment(tests.created_at).format(
        "YYYY-MM-DD-kmmss"
      )}.pdf`;

      return (
        <Fade in={this.props.showPopup}>
          <div
            className="popup"
            onClick={(event) => {
              event.preventDefault();
              if (event.target === event.currentTarget) {
                this.props.closePopup();
              }
            }}
          >
            <div className="popupInnerBg">
              <div className="popupInner">
                <div className="datagrid">
                  <div style={{ overflowX: "auto" }}>
                    <table>
                      <tbody>
                        <tr>
                          <th>ID</th>
                          <th>Site</th>
                          <th>Tested Lights</th>
                          <th>Status</th>
                          {/* <th>Warnings</th> */}
                          <th>Set</th>
                          <th>Test Time</th>
                        </tr>
                        <tr>
                          <td>
                            {tests.id}
                            <Link to={"admin/groups"} />
                          </td>
                          <td>{tests.site}</td>
                          <td>{tests.lights}</td>
                          <td>{tests.result}</td>
                          {/* <td>{tests.errors}</td> */}
                          <td>{tests.set}</td>
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
                          if (item.result) {
                            item.error = item.result;
                          }
                          return (
                            <tr key={index}>
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
                                {`${item.building} - ${item.level} level`}
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
                  <CSVLink
                    data={csvReportArray}
                    target=""
                    className="btn btn-primary"
                  >
                    Download CSV
                  </CSVLink>

                  {!this.state.documentGenerated ? (
                    <button
                      className="btn btn-outline-primary"
                      onClick={this.generatePDF}
                    >
                      Generate PDF
                    </button>
                  ) : (
                    <PDFDownloadLink
                      target=""
                      document={
                        <PdfDocument errorsData={errors} testsData={tests} />
                      }
                      fileName={filename}
                      className="btn btn-success"
                    >
                      {({ blob, url, loading, error }) => {
                        return loading
                          ? "Loading document..."
                          : "Document Ready!";
                      }}
                    </PDFDownloadLink>
                  )}
                </div>

                <div className="buttonContainer2">
                  <IconButton
                    color="secondary"
                    onClick={() => {
                      this.setState({ documentGenerated: false });
                      this.props.closePopup();
                    }}
                  >
                    <Icon>cancel</Icon>
                  </IconButton>
                </div>
              </div>
            </div>
          </div>
        </Fade>
      );
    } else return null;
  }
}

export default Popup;
