import React from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import SummaryCard from "./SummaryCard";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Container from "@material-ui/core/Container";
import FormLabel from "@material-ui/core/FormLabel";
import Skeleton from "@material-ui/lab/Skeleton";

function Loading() {
  return (
    <div>
      <Skeleton variant="rect" width={"70vw"} height={"60vh"} />
    </div>
  );
}

class Dashboard extends React.Component {
  measurements = ["Voltage", "Power", "Current"];

  dayGraphDateFormat = Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
  });
  graphDateFormat = Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  columns = [];
  state = {
    voltage: null,
    power: null,
    current: null,
    show: "voltage",
    time_range: "day",
    URL: global.BASE_URL + "/api/power",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: "Bearer " + localStorage.usertoken,
    },
    summary: {
      month_total: null,
      month_line: null,
      three_months_total: null,
      three_months_line: null,
      year_total: null,
      year_total_line: null,
    },
    loading: true,
    loadingAgg: true,
  };

  datasets_defaults = {
    voltage: {
      label: "Voltage",
      backgroundColor: "rgba(132,99,255,0.2)",
      borderColor: "rgba(132,99,255,1)",
      borderWidth: 1,
      hoverBackgroundColor: "rgba(255,99,132,0.4)",
      hoverBorderColor: "rgba(255,99,132,1)",
      pointRadius: 1,
    },
    power: [
      {
        backgroundColor: "rgba(255, 0, 0,0.2)",
        borderColor: "rgba(255, 0, 0, 1)",
        borderWidth: 1,
        pointRadius: 0,
      },
      {
        backgroundColor: "rgba(0, 255, 0,0.2)",
        borderColor: "rgba(0, 255, 0, 1)",
        borderWidth: 1,
        pointRadius: 0,
      },
      {
        backgroundColor: "rgba(0, 0, 255,0.2)",
        borderColor: "rgba(0, 0, 255, 1)",
        borderWidth: 1,
        pointRadius: 0,
      },
    ],
  };

  yAxisTitles = {
    voltage: "Voltage (V)",
    power: "Power (W)",
    current: "Current (mA)",
  };

  constructor(props) {
    super(props);
    this.chartReference = React.createRef();
    this.onMeasureChangeValue = this.onMeasureChangeValue.bind(this);
    this.onTimeRangeChangeValue = this.onTimeRangeChangeValue.bind(this);
    this.fetchData = this.fetchData.bind(this);
  }

  onMeasureChangeValue(event) {
    this.setState({ show: event.target.value });
    this.fetchData();
  }

  onTimeRangeChangeValue(event) {
    this.setState({ time_range: event.target.value });
    this.fetchData();
  }

  async fetchColumns(refresh) {
    if (!refresh) {
      this.setState({ loading: true });
    }
    const response = await axios.get(this.state.URL + "/lines", {
      headers: this.state.headers,
    });
    const res = response;
    const data = res.data;

    const lines = data.data.map((x) => x.line);
    return ["time"].concat(lines.map((x_1) => "line " + x_1));
  }

  async fetchData(refresh = false) {
    const columns = await this.fetchColumns(refresh);

    axios
      .post(
        this.state.URL + "/values",
        { range: this.state.time_range, measure: this.state.show },
        {
          headers: this.state.headers,
        }
      )
      .then((res) => {
        const data = res.data;
        switch (this.state.show) {
          case "voltage":
            {
              const voltage = data.data.map((d) => ({
                x: d.epoch,
                y: d.values,
              }));
              this.setState({ voltage: voltage, loading: false });
            }
            break;
          case "power":
            {
              const power = {
                name: "power",
                columns: columns,
                points: data.data.map((d) => this.mapValues(d, columns.length)),
              };
              this.setState({ power: power, loading: false });
            }
            break;
          case "current":
            {
              const current = {
                name: "current",
                columns: columns,
                points: data.data.map((d) => this.mapValues(d, columns.length)),
              };
              this.setState({ current: current, loading: false });
            }
            break;
        }
      });
  }

  async fetchAggregate() {
    console.log("fetch aggregate");
    const response = await axios.post(
      this.state.URL + "/aggregate",
      { measure: "power" },
      { headers: this.state.headers }
    );
    return response;
  }

  mapValues = (data, l) => {
    var point = {
      x: data.epoch,
      values: data.values.split(",").map((v) => parseFloat(v)),
    };

    for (let index = 0; index < l - 1; index++) {
      const el = data.values[index];
      point["x" + index] = el;
    }
    return point;
  };

  componentDidMount() {
    this.fetchData(false);
    this.fetchAggregate().then((res) => {
      this.setState({ summary: res.data.summary, loadingAgg: false });
      console.log(res);
    });
    this.interval = setInterval(() => this.fetchData(true), 1000 * 60);
  }

  render() {
    var graph = <Loading />;
    const measure = this.state.show;
    const data_ = this.state[measure];

    if (data_) {
      console.log(data_);
      let labels;
      let datasets;

      if (measure === "voltage") {
        var dataset = this.datasets_defaults["voltage"];
        dataset.data = data_;
        datasets = [dataset];

        if (this.state.time_range === "day") {
          labels = data_
            .map((x) => new Date(new Date(x["x"] * 1000)))
            .map(this.dayGraphDateFormat.format);
        } else {
          labels = data_
            .map((x) => new Date(new Date(x["x"] * 1000)))
            .map(this.graphDateFormat.format);
        }
      } else {
        if (this.state.time_range === "day") {
          labels = data_.points
            .map((x) => new Date(new Date(x["x"] * 1000)))
            .map(this.dayGraphDateFormat.format);
        } else {
          labels = data_.points
            .map((x) => new Date(new Date(x["x"] * 1000)))
            .map(this.graphDateFormat.format);
        }
        datasets = [];
        for (let i = 1; i < data_.columns.length; i++) {
          const dataset = this.datasets_defaults["power"][i - 1];
          dataset.label = data_.columns[i];
          dataset.data = data_.points.map((v) => v.values[i - 1]);
          datasets.push(dataset);
        }
      }

      const options = {
        scales: {
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: this.yAxisTitles[measure],
              },
            },
          ],
        },
      };
      const data = { labels: labels, datasets: datasets };
      graph = this.state.loading ? (
        <Loading />
      ) : (
        <Line ref={this.chartReference} data={data} options={options} />
      );
    }

    return (
      <Container>
        <br />
        <Container>
          <Grid
            container
            direction="row"
            justify="space-evenly"
            alignItems="center"
            spacing={2}
          >
            <SummaryCard
              loading={this.state.loadingAgg}
              title="30 Days"
              total_data={this.state.summary.month}
              line_data={this.state.summary.month_line}
            />
            <SummaryCard
              loading={this.state.loadingAgg}
              title="3 Months"
              total_data={this.state.summary.three_months}
              line_data={this.state.summary.three_months_line}
            />
            <SummaryCard
              loading={this.state.loadingAgg}
              title="Year"
              total_data={this.state.summary.year}
              line_data={this.state.summary.year_line}
            />
          </Grid>
        </Container>
        <br />
        <br />
        <Grid container direction="row">
          <Grid item>
            <FormLabel>Measurement: </FormLabel>
            <RadioGroup
              name="measurement"
              row
              onChange={this.onMeasureChangeValue}
            >
              {this.measurements.map((m) => (
                <FormControlLabel
                  key={m.toLowerCase()}
                  value={m.toLowerCase()}
                  control={<Radio />}
                  label={m}
                  checked={this.state.show === m.toLowerCase()}
                />
              ))}
            </RadioGroup>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item>
            <FormLabel>Time Range: </FormLabel>
            <RadioGroup
              name="time_range"
              row
              onChange={this.onTimeRangeChangeValue}
            >
              <FormControlLabel
                key="day"
                value="day"
                control={<Radio />}
                label="1 Day"
                checked={this.state.time_range === "day"}
              />
              <FormControlLabel
                key="month"
                value="month"
                control={<Radio />}
                label="1 Month"
                checked={this.state.time_range === "month"}
              />
              <FormControlLabel
                key="three_months"
                value="three_months"
                control={<Radio />}
                label="3 Months"
                checked={this.state.time_range === "three_months"}
              />
              <FormControlLabel
                key="year"
                value="year"
                control={<Radio />}
                label="1 Year"
                checked={this.state.time_range === "year"}
              />
            </RadioGroup>
          </Grid>
        </Grid>
        {graph}
      </Container>
    );
  }
}

export default Dashboard;
