const React = require("react");
const D3Component = require("idyll-d3-component");
const d3 = require("d3");

const width = 500,
  svgWidth = 600,
  svgHeight = 200,
  nodeSize = 12,
  lineWidth = 10,
  nodeColorIncomplete = "#d8d8d8",
  nodeColorComplete = "orange",
  nodeColorLast = "#444";

// Expects props.data: array of process objects
class ProcessChain extends D3Component {
  initialize(node, props) {
    console.log("initialize called");
    const svg = (this.svg = d3.select(node).append("svg"));
    svg.style("width", svgWidth).style("height", svgHeight);

    if (this.validData(props)) {
      return false;
    }

    this.draw(props, false);
  }

  update(props) {
    console.log("update called");
    if (this.validData(props)) {
      return false;
    }

    this.draw(props, true);
  }

  validData(props) {
    console.log("validData called");
    if (!props.data || props.data.length === 0) {
      throw "ProcessChain is missing data param.";
      return false;
    }

    if (!props.versions || props.versions.length === 0) {
      throw "ProcessChain is missing versions param.";
      return false;
    }

    if (props.data.length !== props.versions.length) {
      throw "ProcessChain requires version and data length to match.";
    }
  }

  // For ProcessChain, we need just the specified versions
  reformatData(data, versions) {
    var processes = data.map((process, i) => {
      var version = process.versions.find(v => v.version === versions[i]);
      return Object.assign(version, {
        process: process.process,
        name: process.name
      });
    });

    return processes;
  }

  draw(props, clear) {
    console.log("draw called");
    if (clear) {
      this.svg.selectAll("*").remove();
    }

    var data = props.data.slice();
    var versions = props.versions.slice();
    data = this.reformatData(data, versions);

    console.log("after reformatting:");
    console.log(data);

    // How many rows do we need?
    var numRows = data.length;
    console.log(numRows);
  }
}

module.exports = ProcessChain;
