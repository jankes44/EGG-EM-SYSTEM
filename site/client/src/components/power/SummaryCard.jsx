import React from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Skeleton from "@material-ui/lab/Skeleton";

function Loading() {
  return (
    <div>
      <Skeleton variant="rect" width={"13vw"} height={"30vh"} />
    </div>
  );
}

const SummaryCard = ({ title, total_data, line_data, loading }) => {
  if (!loading)
    return (
      <Card>
        {title && total_data && line_data.length ? (
          <CardContent>
            <Typography variant="h5" component="h2">
              {title}
            </Typography>
            <Typography variant="h6" component="h6">
              {" "}
              {total_data[0].power_consumption} Kwh{" "}
            </Typography>
            <br />
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
              spacing={2}
            >
              {line_data.map((x) => (
                <p key={x.line}>
                  Line {x.line}: {x.power_consumption.toFixed(2)} Kwh{" "}
                </p>
              ))}
            </Grid>
          </CardContent>
        ) : null}
      </Card>
    );
  else return <Loading />;
};

export default SummaryCard;
