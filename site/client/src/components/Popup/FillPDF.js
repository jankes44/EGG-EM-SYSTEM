import React, {useState} from "react";
import {TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import axios from "axios";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "25ch",
    },
    TextField: {
      minHeight: 420,
    },
  },
}));

function Multiline(props) {
  const classes = useStyles();

  return (
    <TextField
      multiline
      rows={props.rowsMax ? props.rowsMax : 5}
      label={props.label ? props.label : "No label"}
      defaultValue={props.defValue ? props.defValue : ""}
      variant="outlined"
      onChange={props.onChange}
      name={props.name}
      fullWidth={true}
      style={{width: "48%"}}
    />
  );
}

export default function FillPDF(props) {
  const classes = useStyles();

  const [state, setState] = useState({
    mtfm: "",
    orderNo: "",
    certNo: "",
    siteContact: "",
    engTel: "",
    engName: "",
    defects: "",
    rectifyAction: "",
    remedialWorks: "",
    safeguardAction: "",
    partsRequired: "",
  });

  React.useEffect(() => {
    setState({
      ...state,
      defects: props.defects,
    });
    // eslint-disable-next-line
  }, [props.defects]);

  const downloadOfficialReport = (e) => {
    e.preventDefault();
    const tests = props.test;
    axios({
      url:
        global.BASE_URL + "/api/generatepdf/generateOfficialReport/" + tests.id,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      method: "POST",
      responseType: "blob",
      data: {userinput: state},
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

  function handleChange(e) {
    const value = e.target.value;
    setState({
      ...state,
      [e.target.name]: value,
    });
  }

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <div>
        <div>
          <TextField
            onChange={handleChange}
            name="mtfm"
            required
            label="MTFM Asset Ref"
          />
          <TextField
            onChange={handleChange}
            name="orderNo"
            required
            label="Work order no"
          />
          <TextField
            onChange={handleChange}
            name="certNo"
            required
            label="Certificate no"
          />
          <TextField
            onChange={handleChange}
            name="siteContact"
            required
            label="Site contact"
          />
          <TextField
            onChange={handleChange}
            name="engTel"
            required
            label="Contact tel no"
          />
          <TextField
            onChange={handleChange}
            name="engName"
            required
            label="Engineer name"
          />
        </div>
        <div>
          <Multiline
            onChange={handleChange}
            name="defects"
            label="List of any defects or variations"
            defValue={props.defects}
          />
          <Multiline
            onChange={handleChange}
            name="rectifyAction"
            label="Action taken to rectify the system"
          />
          <Multiline
            onChange={handleChange}
            name="remedialWorks"
            label="Remedial works required"
          />
          <Multiline
            onChange={handleChange}
            name="safeguardAction"
            label="Action taken to safeguard the premises"
          />
          <Multiline
            onChange={handleChange}
            name="partsRequired"
            label="Are any parts required? If so, detail requirements"
          />
        </div>
      </div>
      <button
        onClick={downloadOfficialReport}
        className="btn btn-primary m-3 mb-5"
      >
        Download PDF
      </button>
    </form>
  );
}
