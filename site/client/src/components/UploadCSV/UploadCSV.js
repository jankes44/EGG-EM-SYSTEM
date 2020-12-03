import React, {useState} from "react";
import {Button} from "@material-ui/core";
import MaterialTable from "material-table";
import CSVReader from "react-csv-reader";
import axios from "axios";
import Select from "react-select";
import {Typography} from "@material-ui/core";

export default function UploadCSV(props) {
  const [rendered, setRendered] = useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [deviceCols, setDeviceCols] = useState([]);
  const [options, setOptions] = useState([]);

  const csvJSON = (csv) => {
    console.log(csv);
    var result = [];

    var headers = csv[0];

    for (var i = 1; i < csv.length; i++) {
      var obj = {};
      var currentline = csv[i];

      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }

      result.push(obj);
    }

    //return result; //JavaScript object
    return result; //JSON
  };

  const onFileLoaded = (data, fileInfo) => {
    let c = [];
    data[0].map((el) => {
      c.push({field: el, title: el});
    });

    const dataJSON = csvJSON(data);
    const dataLimited = dataJSON.slice(0, 5);

    // console.log(autoMapping(data[0]));
    // console.log(prepareCsvForInsert(dataJSON));
    let optionsData = [];

    data[0].forEach((el) => {
      optionsData.push({value: el, label: el});
    });
    setOptions(optionsData);
    setColumns(c);
    setData(dataLimited);
    setRendered(true);
  };

  const autoMapping = (cols) => {
    let mapping = [];
    const re = new RegExp(/\s|-|_/g);
    cols.forEach((c) => {
      let c_ = c.toLowerCase().replace(re, "");
      deviceCols.forEach((dc) => {
        let dc_ = dc.key1.toLowerCase().replace(re, "");
        console.log(dc_, c_);
        if (dc_ === c_) {
          dc = {key1: dc.key1, key2: c};
          mapping.push(dc);
        }
      });
    });
    mapping.forEach((el) => {
      deviceCols.forEach((dc) => {
        console.log(dc);
      });
    });
    return mapping;
  };

  const prepareCsvForInsert = (input) => {
    const mapping = {node: "node_id", id: "id"};

    return input.map((n) =>
      Object.keys(n)
        .filter((key) => mapping.hasOwnProperty(key))
        .reduce((obj, key) => {
          obj[mapping[key]] = n[key];
          return obj;
        }, {})
    );
  };

  const getColumns = () => {
    axios({
      //Axios GET request
      method: "get",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/lights/columns/columns",
    }).then((res) => {
      let data = res.data.map((el) => {
        return {key1: el.Field, key2: ""};
      });

      setDeviceCols(data);
    });
  };

  const selectOnChange = (selected, el) => {
    const index = deviceCols.findIndex((dc) => dc.key1 === el.key1);
    let cols = deviceCols;
    cols[index].key2 = selected.value;
    setDeviceCols(cols);
    console.log("SELECTED", deviceCols);
  };

  React.useEffect(() => {
    getColumns();
  }, []);

  return (
    <div>
      {rendered && columns.length > 0 ? (
        <div>
          <MaterialTable columns={columns} data={data} title="Data" />
          <Typography variant="h4">Assign your data columns</Typography>
          <ul style={{width: "100%"}}>
            {deviceCols.map((el, index) => (
              <li
                style={{
                  listStyle: "none",
                  width: "100%",
                  display: "flex",
                  backgroundColor: "#00A957",
                  borderRadius: "4px",
                  padding: "10px",
                }}
                key={index}
              >
                <div
                  style={{
                    width: "20%",
                    textAlign: "left",
                    fontSize: "1.2em",
                    fontWeight: "lighter",
                    marginRight: "50px",
                    color: "#FFFFFF",
                  }}
                >
                  {el.key1}
                </div>
                <div style={{width: "45%"}}>
                  <Select
                    options={options}
                    onChange={(s) => selectOnChange(s, el)}
                    defaultValue={el.key2}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Typography variant="h6">Select CSV file you wish to import</Typography>
      )}

      <CSVReader onFileLoaded={onFileLoaded} />
    </div>
  );
}
