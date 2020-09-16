import React from "react";
import "./style.css";

const Tooltip = () => {
  return (
    <div className="tooltip">
      <div className="tooltipInner">
        <div className="infoContainer">
          <p>
            Test Info - Lorem Ipsum is simply dummy text of the printing and
            typesetting industry. Lorem Ipsum has been the industry's standard
            dummy text ever since the 1500s, when an unknown printer took a
            galley of type and scrambled it to make a type specimen book.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
