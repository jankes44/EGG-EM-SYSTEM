import React, {useState} from "react";
import MaterialTable from "material-table";
import CSVReader from "react-csv-reader";
import axios from "axios";
import Select from "react-select";
import {Typography, Button} from "@material-ui/core";

export default function UploadCSV(props) {
  const [rendered, setRendered] = useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [dataFull, setDataFull] = useState([]);
  const [mapping, setMapping] = useState([]);
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
    setDataFull(dataJSON);
    setRendered(true);
  };

  const autoMapping = (cols) => {
    let mapping = [];
    const re = new RegExp(/\s|-|_/g);
    cols.forEach((c) => {
      let c_ = c.toLowerCase().replace(re, "");
      mapping.forEach((dc) => {
        let dc_ = dc.key1.toLowerCase().replace(re, "");
        console.log(dc_, c_);
        if (dc_ === c_) {
          dc = {key1: dc.key1, key2: c};
          mapping.push(dc);
        }
      });
    });
    mapping.forEach((el) => {
      mapping.forEach((dc) => {
        console.log(dc);
      });
    });
    return mapping;
  };

  const renameKeys = (keysMap, obj) => {
    Object.keys(obj).reduce(
      (acc, key) => ({
        ...acc,
        ...{[keysMap[key] || key]: obj[key]},
      }),
      {}
    );
  };

  const getColumns = () => {
    const notRequiredCols = [
      "id",
      "status",
      "created_at",
      "updated_at",
      "fp_coordinates_left",
      "fp_coordinates_bot",
      "is_assigned",
      "levels_id",
    ];

    axios({
      //Axios GET request
      method: "get",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      url: global.BASE_URL + "/api/lights/columns/columns",
    }).then((res) => {
      const notUndefined = (anyValue) => typeof anyValue !== "undefined";
      let data = res.data
        .map((el) => {
          let required = !notRequiredCols.some((n) => el.Field === n);
          if (required) return {[el.Field]: ""};
          console.log({[el.Field]: ""});
        })
        .filter(notUndefined);
      data.push({level_name: ""});
      console.log(data);
      setMapping(data);
    });
  };

  const findObjByKey = (array, key) => {
    return array.findIndex((el) => Object.keys(el)[0] === key);
  };

  const selectOnChange = (selected, el) => {
    const objectKey = Object.keys(el)[0];
    const index = findObjByKey(mapping, objectKey);

    let cols = mapping;

    cols[index][objectKey] = selected.value;

    setMapping(cols);

    console.log("SELECTED", mapping);
  };

  //our_db: csv

  const objectFlip = (obj) => {
    const ret = {};
    Object.keys(obj).forEach((key) => {
      ret[obj[key]] = key;
    });
    return ret;
  };

  const changeObjKeys = (columns_, input) => {
    const columns = objectFlip(columns_);
    return input.map((n) =>
      Object.keys(n)
        .filter((key) => columns.hasOwnProperty(key))
        .reduce((obj, key) => {
          obj[columns[key]] = n[key] === "" ? null : n[key];
          return obj;
        }, {})
    );
  };

  const prepareCsvForInsert = () => {
    let mappingObj = {};
    mapping.forEach((el) => {
      Object.assign(mappingObj, el);
    });

    const data = {
      data: changeObjKeys(mappingObj, dataFull),
      buildingId: props.building.buildings_id,
    };

    axios({
      method: "POST",
      url: global.BASE_URL + "/api/upload/building",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
      data: data,
    }).then((res) => {
      console.log(res);
    });
  };

  React.useEffect(() => {
    getColumns();
  }, []);

  return (
    <div>
      {rendered && columns.length > 0 ? (
        <div>
          <MaterialTable columns={columns} data={data} title="Data" />

          <ul style={{width: "100%", margin: "50px", marginLeft: "-40px"}}>
            <Typography variant="h4">Assign your data columns</Typography>
            <div
              style={{
                width: "100%",
                display: "flex",
                backgroundColor: "#00A957",
                borderRadius: "4px",
                padding: "10px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "20%",
                  textAlign: "left",
                  fontSize: "1.2em",
                  marginRight: "50px",
                  color: "#FFFFFF",
                }}
              >
                System columns
              </div>
              <div
                style={{
                  width: "20%",
                  textAlign: "left",
                  fontSize: "1.2em",
                  marginRight: "50px",
                  color: "#FFFFFF",
                }}
              >
                Your columns
              </div>
            </div>
            {mapping.map((el, index) => {
              const objectKey = Object.keys(el)[0];
              console.log(objectKey);
              return (
                <li
                  style={{
                    listStyle: "none",
                    width: "100%",
                    display: "flex",
                    backgroundColor: "#00A957",
                    borderRadius: "4px",
                    padding: "10px",
                    marginBottom: "20px",
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
                    {objectKey}
                  </div>
                  <div style={{width: "45%"}}>
                    <Select
                      options={options}
                      onChange={(s) => selectOnChange(s, el)}
                      defaultValue={el.key2}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <Button
            variant="contained"
            color="primary"
            onClick={prepareCsvForInsert}
            style={{float: "right"}}
          >
            IMPORT
          </Button>
        </div>
      ) : (
        <Typography variant="h6">Select CSV file you wish to import</Typography>
      )}

      <CSVReader onFileLoaded={onFileLoaded} />
    </div>
  );
}
