import React from "react";
import Icon from "@material-ui/core/Icon";
import { IconButton } from "@material-ui/core";
import "./style.css";
import moment from "moment";

const Popup = (props) => {
  var array = [];
  var date;
  var id;
  props.data.forEach((element) => {
    if (element.schedule_id === props.clicked) {
      array.push(element);
      date = element.date;
      id = element.schedule_id;
    }
  });
  return (
    <div className="popup">
      <div className="popupInnerBg">
        <div className="popupInner2" style={{ textAlign: "left" }}>
          <h3>Function Test - schedule id: {id}</h3>
          <h5
            style={{ fontSize: "1.2em", fontWeight: "lighter", color: "navy" }}
          >
            Scheduled for: {moment(date).format("DD.MM.YYYY k:mm")}
          </h5>
          <h3>Locations</h3>
          <div style={{ borderBottom: "1px solid grey", width: "300px" }}>
            {array.map((item, index) => {
              return (
                <h5
                  key={index}
                  style={{
                    borderTop: "1px solid grey",
                  }}
                >
                  {item.level} level - {item.group_name}
                </h5>
              );
            })}
          </div>
          <div className="buttonContainer">
            <IconButton color="secondary" onClick={props.closePopup}>
              <Icon>cancel</Icon>
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
