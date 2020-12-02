import React, {Component} from "react";
import DevTest from "components/Developer/TestComponentDev";
import SocketDev from "components/Developer/SocketDev";
export default class Developer extends Component {
  render() {
    return (
      <div>
        <DevTest />
        <SocketDev />
      </div>
    );
  }
}
