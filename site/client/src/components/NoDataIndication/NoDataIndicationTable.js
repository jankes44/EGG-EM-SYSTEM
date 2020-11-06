import React from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import Typography from "@material-ui/core/Typography";

export default function NoDataIndication() {
  return (
    <div>
      <Typography variant="h3">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </Typography>
    </div>
  );
}
