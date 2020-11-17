import React from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
} from "@material-ui/core";

export default function RadioButtonsGroup(props) {
  const [state, setState] = React.useState({
    checkedA: true,
    checkedB: true,
    checkedF: true,
    checkedG: true,
  });

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };
  return (
    <div>
      <FormControl component="fieldset">
        <FormLabel component="legend">Test type</FormLabel>
        <RadioGroup
          aria-label="type"
          name="type"
          value={props.value}
          onChange={props.handleChange}
        >
          <FormControlLabel
            value="Monthly"
            control={<Radio />}
            label="Monthly"
          />
          <FormControlLabel value="Annual" control={<Radio />} label="Annual" />
        </RadioGroup>
      </FormControl>
      <FormControl component="fieldset">
        <FormLabel component="legend">Randomize</FormLabel>
        <RadioGroup
          aria-label="type"
          name="type"
          value={props.value}
          onChange={props.handleChange}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={state.checkedB}
                onChange={handleChange}
                name="checkedB"
                color="secondary"
              />
            }
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
}
