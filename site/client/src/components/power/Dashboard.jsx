import React from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import SummaryCard from './SummaryCard'
import Grid from '@material-ui/core/Grid'

class Dashboard extends React.Component {
  columns = [];
  state = {
    voltage: null,
    power: null,
    current: null,
    show: "voltage",
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
      year_total_line: null
    }
  };

  constructor(props) {
    super(props);
    this.chartReference = React.createRef();
    this.onChangeValue = this.onChangeValue.bind(this);
  }

  onChangeValue(event) {
    this.setState({ show: event.target.value });
  }

  async fetchColumns() {
    const response = await axios.get(this.state.URL + "/lines", {
      headers: this.state.headers,
    });
    const res = response;
    const data = res.data;

    const lines = data.data.map((x) => x.line);
    return ["time"].concat(lines.map((x_1) => "line " + x_1));
  }

  async fetchData() {
    const columns = await this.fetchColumns();

    axios
      .post(this.state.URL + "/voltage", {}, {
        headers: this.state.headers,
      })
      .then((res) => {
        const data = res.data;
        const voltage = data.data.map((d) => ({ x: d.epoch, y: d.voltage }));
        this.setState({ voltage: voltage });
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .post(this.state.URL + "/power", {}, {
        headers: this.state.headers,
      })
      .then((res) => {
        const data = res.data;
        const power = {
          name: "power",
          columns: columns,
          points: data.data.map((d) => {
            var point = {
              x: d.epoch,
              values: d.values.split(",").map((v) => parseFloat(v)),
            };

            for (let index = 0; index < columns.length - 1; index++) {
              const el = d.values[index];
              point["x" + index] = el;
            }
            return point;
          }),
        };
        console.log(power);
        this.setState({ power: power });
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .post(this.state.URL + "/current", {}, {
        headers: this.state.headers,
      })
      .then((res) => {
        const data = res.data;
        const current = {
          name: "current",
          columns: columns,
          points: data.data.map((d) => {
            var point = {
              x: d.epoch,
              values: d.values.split(",").map((v) => parseFloat(v)),
            };
            for (let index = 0; index < columns.length - 1; index++) {
              const el = d.values[index];
              point["x" + index] = el;
            }
            return point;
          }),
        };
        this.setState({ current: current });
      })
      .catch((err) => {
        console.log(err);
      });

      axios
      .post(this.state.URL + "/power", {aggregate: "total_month"}, {
        headers: this.state.headers
      })
      .then((res) => {
        const month_total = res.data.data[0].power_consumption.toFixed(2)
        var summary = {...this.state.summary}
        summary.month_total = month_total 
        this.setState({summary: summary})
      })
      .catch((err) => {
        console.log(err);
      });

  axios
      .post(this.state.URL + "/power", {aggregate: "total_three_months"}, {
        headers: this.state.headers,
      })
      .then((res) => {
        const three_months = res.data.data[0].power_consumption.toFixed(2)
        var summary = {...this.state.summary}
        summary.three_months_total = three_months 
        this.setState({summary: summary})
      })
      .catch((err) => {
        console.log(err);
      });

  axios
      .post(this.state.URL + "/power", {aggregate: "total_year"}, {
        headers: this.state.headers,
      })
      .then((res) => {
        const year_total = res.data.data[0].power_consumption.toFixed(2)
        var summary = {...this.state.summary}
        summary.year_total = year_total 
        this.setState({summary: summary})
      })
      .catch((err) => {
        console.log(err);
      });

      axios
      .post(this.state.URL + "/power", {aggregate: "total_month_line"}, {
        headers: this.state.headers,
        
      })
      .then((res) => {
        const month_total_line = res.data.data
        var summary = {...this.state.summary}
        summary.month_line = month_total_line 
        this.setState({summary: summary})
      })
      .catch((err) => {
        console.log(err);
      });

  axios
      .post(this.state.URL + "/power", {aggregate: "total_three_months_line"}, {
        headers: this.state.headers,
        
      })
      .then((res) => {
        const three_months_line = res.data.data
        var summary = {...this.state.summary}
        summary.three_months_line = three_months_line 
        this.setState({summary: summary})
      })
      .catch((err) => {
        console.log(err);
      });

  axios
      .post(this.state.URL + "/power", {aggregate: "total_year_line"}, {
        headers: this.state.headers,    
      })
      .then((res) => {
        const year_total_line = res.data.data
        var summary = {...this.state.summary}
        summary.year_total_line = year_total_line
        this.setState({summary: summary}) 
      })
      .catch((err) => {
        console.log(err);
      });
    }

  componentDidMount() {
    this.fetchData();
    this.interval = setInterval(() => this.fetchData(), 1000 * 60);
  }

  render() {
    var graph = <div> LOADING ... </div>;
    if (this.state.voltage && this.state.show === "voltage") {
      const labels = this.state.voltage.map((x) =>
        new Date(new Date(x["x"] * 1)).toLocaleString()
      );
      const voltageData = {
        labels: labels,
        datasets: [
          {
            label: "Voltage",
            backgroundColor: "rgba(132,99,255,0.2)",
            borderColor: "rgba(132,99,255,1)",
            borderWidth: 1,
            hoverBackgroundColor: "rgba(255,99,132,0.4)",
            hoverBorderColor: "rgba(255,99,132,1)",
            data: this.state.voltage,
            pointRadius: 1,
          },
        ],
      };
      graph = <Line ref={this.chartReference} data={voltageData} />;
    } else if (this.state.power && this.state.show === "power") {
      const power_ = this.state.power;
      const labels = power_.points.map((x) =>
        new Date(new Date(x["x"] * 1)).toLocaleString()
      );
      const powerDataSets = [];
      for (let i = 1; i < power_.columns.length; i++) {
        const R = i === 1 ? 255 : 0;
        const G = i === 2 ? 255 : 0;
        const B = i === 3 ? 255 : 0;
        const dataset = {
          label: power_.columns[i],
          backgroundColor: "rgba(" + R + "," + G + "," + B + ",0.2)",
          borderColor: "rgba(" + R + "," + G + "," + B + ",1)",
          borderWidth: 1,
          data: power_.points.map((v) => v.values[i - 1]),
          pointRadius: 0,
        };
        powerDataSets.push(dataset);
      }
      const powerData = { labels: labels, datasets: powerDataSets };
      graph = <Line ref={this.chartReference} data={powerData} />;
    } else if (this.state.current && this.state.show === "current") {
      const current_ = this.state.current;
      const labels = current_.points.map((x) =>
        new Date(new Date(x["x"] * 1)).toLocaleString()
      );
      const currentDatasets = [];
      for (let i = 1; i < current_.columns.length; i++) {
        const R = i === 1 ? 255 : 0;
        const G = i === 2 ? 255 : 0;
        const B = i === 3 ? 255 : 0;
        const dataset = {
          label: current_.columns[i],
          backgroundColor: "rgba(" + R + "," + G + "," + B + ",0.2)",
          borderColor: "rgba(" + R + "," + G + "," + B + ",1)",
          borderWidth: 1,
          data: current_.points.map((v) => v.values[i - 1]),
          pointRadius: 0,
        };
        currentDatasets.push(dataset);
      }
      const currentData = { labels: labels, datasets: currentDatasets };
      graph = <Line ref={this.chartReference} data={currentData} />;
    }

    return (
      <div>
        <Grid container direction="row" justify="center" alignItems="center" spacing={4}>
          <SummaryCard title="30 Days" total_data={this.state.summary.month_total} 
          line_data={this.state.summary.month_line}/>
          <SummaryCard title="3 Months" total_data={this.state.summary.three_months_total} 
          line_data={this.state.summary.three_months_line}/>
          <SummaryCard title="Year" total_data={this.state.summary.year_total} 
          line_data={this.state.summary.year_total_line}/>
        </Grid>
        <div onChange={this.onChangeValue}>
          <input
            type="radio"
            value="voltage"
            name="measurement"
            checked={this.state.show === "voltage"}
          />{" "}
          Voltage
          <input
            type="radio"
            value="power"
            name="measurement"
            checked={this.state.show === "power"}
          />{" "}
          Power
          <input
            type="radio"
            value="current"
            name="measurement"
            checked={this.state.show === "current"}
          />{" "}
          Current
        </div>
        {graph}
      </div>
    );
  }
}

export default Dashboard;
