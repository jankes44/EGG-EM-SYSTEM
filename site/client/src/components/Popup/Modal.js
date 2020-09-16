import React from "react";
import Popup from "reactjs-popup";
export default () => (
  <Popup trigger={<button className="button"> Open Modal </button>} modal>
    {close => (
      <div className="modal">
        <a className="close" onClick={close}>
          &times;
        </a>
        <div className="header"> Modal Title </div>
        <div className="content">

          <br />
          
        </div>
        <div className="actions">

          <button
            className="button"
            onClick={() => {
              console.log("modal closed ");
              close();
            }}
          >
            close modal
          </button>
        </div>
      </div>
    )}
  </Popup>
);