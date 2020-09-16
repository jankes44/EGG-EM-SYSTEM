import React from "react";
import "./style.css";
import axios from "axios";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";

class Popup extends React.Component {
  state = {
    tests: [
      {
        id: null,
        group_id: null,
        lights: null,
        result: "",
        warning: null,
        info: "",
        created_at: ""
      }
    ]
  };

  componentDidMount() {
    axios
      .get("http://127.0.0.1:3333/tests/" + this.props.rowId)
      .then(response => {
        this.setState({
          tests: response.data
        });
      });
  }

  render() {

    return (
      <div className="popup">
        <div className="popupInner">
          <Button
            className="buttonStyle"
            variant="contained"
            color="secondary"
            onClick={this.props.closePopup}
          >
            close
          </Button>
        </div>
      </div>
    );
  }
}

export default Popup;
