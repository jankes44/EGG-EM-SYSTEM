import React, { useState } from "react";
import { Button } from "@material-ui/core";
import MaterialTable from "material-table";
import CSVReader from "react-csv-reader";

export default function UploadCSV(props) {
  const [rendered, setRendered] = useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

  function csvJSON(csv) {
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
  }

  return (
    <div>
      {rendered && columns.length > 0 ? (
        <MaterialTable columns={columns} data={data} title="Data" />
      ) : null}
      <CSVReader
        onFileLoaded={(data, fileInfo) => {
          let c = [];
          data[0].map((el) => {
            c.push({ field: el, title: el });
          });

          setColumns(c);
          setData(csvJSON(data));
          setRendered(true);
        }}
      />
    </div>
  );
}
