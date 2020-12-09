import React, { Component } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import PersonIcon from "@material-ui/icons/Person";
import AddIcon from "@material-ui/icons/Add";
import Typography from "@material-ui/core/Typography";
import { blue } from "@material-ui/core/colors";
import TextField from "@material-ui/core/TextField";
import { Grid } from "@material-ui/core";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import { set } from "date-fns";

const useStyles = makeStyles({
  root: {
    "& > *": {
      margin: 20,
      width: 200
    }
  },
  button: {
    "& > *": {
      margin: 20,
      width: 150
    }
  }
});

function SimpleDialog(props) {
  const classes = useStyles();
  const { onClose, open } = props;

  const handleClose = () => {
    onClose();
  };

  const timeOutButton = () => {
    setTimeout(handleButtonClose, 2000);
    clearTimeout(handleButtonClose, 1000);
  };

  const handleButtonClose = () => {
    onClose();
  };

  const handleListItemClick = value => {
    onClose(value);
  };

  class LightForm extends Component {
    constructor(props) {
      super(props);

      this.state = {
        groupid: null,
        name: "",
        location: "",
        description: ""
      };
    }

    changeHandlerInt = e => {
      this.setState({
        [e.target.name]:
          e.target.type === "number" ? parseInt(e.target.value) : e.target.value
      });
    };

    changeHandler = e => {
      this.setState({ [e.target.name]: e.target.value });
    };

    submitHandler = e => {
      e.preventDefault();
      console.log(this.state);
      axios
        .post("http://127.0.0.1:3333/lights", this.state)
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.log(error);
        });
    };

    render() {
      const { classes } = this.props;
      const { username, email, password } = this.state;
      return (
        <div>
          <form onSubmit={this.submitHandler}>
            <div>
              <TextField
                label="Username"
                name="username"
                value={username}
                onChange={this.changeHandler}
              />
            </div>
            <div>
              <TextField
                label="email"
                name="email"
                value={email}
                onChange={this.changeHandler}
              />
            </div>
            <div>
              <TextField
                label="Password"
                type="password"
                name="password"
                value={password}
                onChange={this.changeHandler}
              />
            </div>
            <Button onClick={timeOutButton} type="submit">
              Submit
            </Button>
          </form>
        </div>
      );
    }
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <DialogTitle id="simple-dialog-title">Add User</DialogTitle>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

export default function SimpleDialogDemo() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = value => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Add User
      </Button>
      <SimpleDialog open={open} onClose={handleClose} />
    </div>
  );
}
