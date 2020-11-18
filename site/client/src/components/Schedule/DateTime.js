import React, { useState } from "react";
import { DateTimePicker, KeyboardDateTimePicker } from "@material-ui/pickers";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

function InlineDateTimePickerDemo(props) {
  const [selectedDate, handleDateChange] = useState(
    new Date("2018-01-01T00:00:00.000Z")
  );

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DateTimePicker
          variant="inline"
          label="Basic example"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </MuiPickersUtilsProvider>
    </>
  );
}

export default InlineDateTimePickerDemo;
