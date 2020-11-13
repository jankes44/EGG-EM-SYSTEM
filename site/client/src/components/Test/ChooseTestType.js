import React from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

export default function RadioButtonsGroup(props) {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Test type</FormLabel>
      <RadioGroup
        aria-label="type"
        name="type"
        value={props.value}
        onChange={props.handleChange}
      >
        <FormControlLabel value="Monthly" control={<Radio />} label="Monthly" />
        <FormControlLabel value="Annual" control={<Radio />} label="Annual" />
      </RadioGroup>
    </FormControl>
  );
}
