import React from "react";
import Draggable from "react-draggable";

export default class DraggableTest extends React.Component {
  state = {
    activeDrags: 0,
    deltaPosition: {
      x: 0,
      y: 0,
    },
    controlledPosition: {
      x: -400,
      y: 200,
    },
  };

  handleDrag = (e, ui) => {
    const { x, y } = this.state.deltaPosition;
    this.setState({
      deltaPosition: {
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      },
    });
  };

  onStart = () => {
    this.setState({ activeDrags: this.state.activeDrags + 1 });
  };

  onStop = () => {
    this.setState({ activeDrags: this.state.activeDrags - 1 });
  };

  // For controlled component
  adjustXPos = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = this.state.controlledPosition;
    this.setState({ controlledPosition: { x: x - 10, y } });
  };

  adjustYPos = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { controlledPosition } = this.state;
    const { x, y } = controlledPosition;
    this.setState({ controlledPosition: { x, y: y - 10 } });
  };

  onControlledDrag = (e, position) => {
    const { x, y } = position;
    this.setState({ controlledPosition: { x, y } });
  };

  onControlledDragStop = (e, position) => {
    this.onControlledDrag(e, position);
    this.onStop();
  };

  eventLogger = (e, data) => {
    console.log("Event: ", e);
    console.log("Data: ", data);
  };

  render() {
    const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
    const { deltaPosition } = this.state;
    return (
      <div>
        <Draggable {...dragHandlers}>
          <div className="jumbotron w-25">I can be dragged anywhere</div>
        </Draggable>
        <Draggable axis="x" {...dragHandlers}>
          <div className="jumbotron w-25 cursor-x">
            I can only be dragged horizonally (x axis)
          </div>
        </Draggable>
        <Draggable axis="y" {...dragHandlers}>
          <div className="jumbotron w-25 cursor-y">
            I can only be dragged vertically (y axis)
          </div>
        </Draggable>
        <Draggable onStart={() => false}>
          <div className="jumbotron w-25">I don't want to be dragged</div>
        </Draggable>
        <Draggable onDrag={this.handleDrag} {...dragHandlers}>
          <div className="jumbotron w-25">
            <div>I track my deltas</div>
            <div>
              x: {deltaPosition.x.toFixed(0)}, y: {deltaPosition.y.toFixed(0)}
            </div>
          </div>
        </Draggable>
        <Draggable handle="strong" {...dragHandlers}>
          <div className="jumbotron w-25 no-cursor">
            <strong className="cursor">
              <div>Drag here</div>
            </strong>
            <div>You must click my handle to drag me</div>
          </div>
        </Draggable>
        <Draggable handle="strong">
          <div
            className="jumbotron w-25 no-cursor"
            style={{
              display: "flex",
              flexDirection: "column",
              height: "350px",
            }}
          >
            <strong className="cursor">
              <div>Drag here</div>
            </strong>
            <div style={{ overflowY: "scroll" }}>
              <div
                style={{
                  background: "yellow",
                  whiteSpace: "pre-wrap",
                }}
              >
                I have long scrollable content with a handle
                {"\n" +
                  Array(40)
                    .fill("x")
                    .join("\n")}
              </div>
            </div>
          </div>
        </Draggable>
        <Draggable cancel="strong" {...dragHandlers}>
          <div className="jumbotron w-25">
            <strong className="no-cursor">Can't drag here</strong>
            <div>Dragging here works</div>
          </div>
        </Draggable>
        <Draggable grid={[25, 25]} {...dragHandlers}>
          <div className="jumbotron w-25">I snap to a 25 x 25 grid</div>
        </Draggable>
        <Draggable grid={[50, 50]} {...dragHandlers}>
          <div className="jumbotron w-25">I snap to a 50 x 50 grid</div>
        </Draggable>
        <Draggable
          bounds={{ top: -100, left: -100, right: 100, bottom: 100 }}
          {...dragHandlers}
        >
          <div className="jumbotron w-25">
            I can only be moved 100px in any direction.
          </div>
        </Draggable>
        <div
          className="jumbotron w-25"
          style={{
            height: "500px",
            width: "500px",
            position: "relative",
            overflow: "auto",
            padding: "0",
          }}
        >
          <div style={{ height: "1000px", width: "1000px", padding: "10px" }}>
            <Draggable bounds="parent" {...dragHandlers}>
              <div className="jumbotron w-25">
                I can only be moved within my offsetParent.
                <br />
                <br />
                Both parent padding and child margin work properly.
              </div>
            </Draggable>
            <Draggable bounds="parent" {...dragHandlers}>
              <div className="jumbotron w-25">
                I also can only be moved within my offsetParent.
                <br />
                <br />
                Both parent padding and child margin work properly.
              </div>
            </Draggable>
          </div>
        </div>
        <Draggable bounds="body" {...dragHandlers}>
          <div className="jumbotron w-25">
            I can only be moved within the confines of the body element.
          </div>
        </Draggable>
        <Draggable {...dragHandlers}>
          <div
            className="jumbotron w-25"
            style={{ position: "absolute", bottom: "100px", right: "100px" }}
          >
            I already have an absolute position.
          </div>
        </Draggable>
      </div>
    );
  }
}
