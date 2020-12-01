import React, {useState} from "react";
import {Button} from "@material-ui/core";
import MaterialTable from "material-table";
import CSVReader from "react-csv-reader";

export default function UploadCSV(props) {
  const [rendered, setRendered] = useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [deviceCols] = useState([
    "id",
    "node_id",
    "type",
    "levels_id",
    "buildings_id",
    "level",
    "building",
  ]);

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

    console.log(autoMapping(data[0]));
    // console.log(prepareCsvForInsert(dataJSON));

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
        let dc_ = dc.toLowerCase().replace(re, "");
        console.log(dc_, c_);
        if (dc_ === c_) mapping.push({[dc]: c});
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

  return (
    <div>
      {rendered && columns.length > 0 ? (
        <MaterialTable columns={columns} data={data} title="Data" />
      ) : null}
      <CSVReader onFileLoaded={onFileLoaded} />
      <ul></ul>
    </div>
  );
}
