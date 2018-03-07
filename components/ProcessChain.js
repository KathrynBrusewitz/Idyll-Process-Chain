const React = require("react");
const D3Component = require("idyll-d3-component");
const d3 = require("d3");

var width = 500,
  height = 400,
  svgWidth = 600,
  svgHeight = 500,
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

    if (this.validData(props)) {
      return false;
    }

    this.updateSvgSize(props);
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

  updateSvgSize(props) {
    var numProcesses = props.data.length;
    height = 90 * numProcesses;
    svgHeight = height;
    this.svg.style("width", svgWidth).style("height", svgHeight);
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

    processes.forEach(process => {
      var lastNode = {
        step: process.steps.length + 1,
        name: "Complete"
      };
      process.steps.push(lastNode);
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

    var numRows = data.length;
    console.log(numRows);

    data.forEach((process, iter) => {
      // Get steps as nodes
      var nodes = process.steps;

      // Calc distances between nodes
      const xdist = width / nodes.length + 1;
      const ydist = height / numRows + 1;

      // Create node locations
      nodes.map(function(d) {
        d["x"] = (d.step - 0.5) * xdist;
        d["y"] = (iter + 0.5) * ydist;
      });

      // Autogenerate links
      var links = [];
      nodes
        .map(function(d, i) {
          if (d.name !== "Complete") {
            links.push({ source: i, target: i + 1, complete: d.complete });
          }
        })
        .filter(function(d) {
          return typeof d !== "undefined";
        });

      console.log(links);
      console.log(nodes);

      // Draw process names
      var processName = this.svg
        .append("text")
        .attr("dx", nodes[0].x - 10)
        .attr("dy", nodes[0].y - 30)
        .text(process.name);

      // Draw links
      var link = this.svg
        .selectAll(".link" + iter)
        .data(links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("x1", function(d) {
          return nodes[d.source].x;
        })
        .attr("y1", function(d) {
          return nodes[d.source].y;
        })
        .attr("x2", function(d) {
          return nodes[d.target].x;
        })
        .attr("y2", function(d) {
          return nodes[d.target].y;
        })
        .style("stroke", function(d) {
          if (d.complete) {
            return nodeColorComplete;
          } else {
            return nodeColorIncomplete;
          }
        });

      // Draw nodes
      var node = this.svg
        .selectAll(".node" + iter)
        .data(nodes)
        .enter()
        .append("g")
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });

      node
        .append("text")
        .attr("class", "tooltip")
        .attr("dx", "-.3em")
        .attr("dy", "2em")
        .attr("opacity", 0)
        .text(function(d) {
          return d.name;
        });

      var circle = node
        .append("circle")
        .attr("class", "node")
        .attr("r", nodeSize)
        .style("fill", function(d) {
          if (d.name !== "Complete") {
            if (d.complete) {
              return nodeColorComplete;
            } else {
              if (d.step === 1 || nodes[d.step - 2].complete) {
                return nodeColorComplete;
              } else {
                return nodeColorIncomplete;
              }
            }
          } else {
            return nodeColorLast;
          }
        })
        .on("mouseover", function(d) {
          if (d.name !== "Complete") {
            if (d.complete) {
              this.setAttribute("stroke", nodeColorComplete);
            } else {
              if (d.step === 1 || nodes[d.step - 2].complete) {
                this.setAttribute("stroke", nodeColorComplete);
              } else {
                this.setAttribute("stroke", nodeColorIncomplete);
              }
            }
          } else {
            this.setAttribute("stroke", nodeColorLast);
          }
          d3
            .select(this.parentNode)
            .selectAll(".tooltip")
            .attr("opacity", 1);
        })
        .on("mouseout", function(d) {
          this.setAttribute("stroke", "none");
          d3
            .select(this.parentNode)
            .selectAll(".tooltip")
            .attr("opacity", 0);
        });

      node
        .append("text")
        .attr("dx", "-.3em")
        .attr("dy", ".3em")
        .style("fill", "white")
        .text(function(d) {
          if (d.name !== "Complete") {
            return d.step;
          }
        });
    });
  }
}

module.exports = ProcessChain;
