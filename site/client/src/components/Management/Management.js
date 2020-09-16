import React, { useState } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";

export default function Management() {
  const [sites, setSites] = useState([]);

  const token = localStorage.usertoken;
  const decoded = jwt_decode(token);
  const usersId = decoded.id;

  axios
    .get(global.BASE_URL + "/api/sites/" + usersId, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.usertoken,
      },
    })
    .then((response) => {
      setSites(response.data);
    });

  return (
    <div style={{ textAlign: "center" }}>
      {sites.map((a, index) => (
        <p key={index} onClick={() => console.log(a.sites_id)}>
          {a.name} {a.building}
        </p>
      ))}
    </div>
  );
}
