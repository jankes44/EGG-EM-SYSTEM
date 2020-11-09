import React from "react";
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

const SummaryCard = ({title, total_data, line_data}) => 
<Card>
    <CardContent>
        <Typography variant="h5" component="h2">{title}</Typography>
        <Typography variant="h6" component="h6"> {total_data} Kwh </Typography>
        <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
            {line_data.map(x => <p>Line {x.line}: {x.power_consumption} Kwh </p>)}
        </Grid>
    </CardContent>
</Card>

export default SummaryCard