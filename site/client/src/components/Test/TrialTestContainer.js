import TrialTest from "components/Test/TrialTest";
import React, { Component } from "react";

export default class TrialTestContainer extends Component {
  state = {};
  componentDidMount() {}

  render() {
    return (
      <div>
        <TrialTest devices={[]} />
      </div>
    );
  }
}
