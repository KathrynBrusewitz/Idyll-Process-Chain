const React = require("react");
const D3Component = require("idyll-d3-component");
const d3 = require("d3");

const width = 400,
  svgWidth = 600,
  height = 200,
  nodeSize = 12,
  lineWidth = 10,
  nodeColorIncomplete = "#d8d8d8",
  nodeColorComplete = "orange",
  nodeColorLast = "#444";

// Expects props.data: array of step objects
// Ignore trigger and dependency relationships
class BasicProcess extends D3Component {
  initialize(node, props) {
    const svg = (this.svg = d3.select(node).append("svg"));
    svg.style("width", svgWidth).style("height", height);

    if (this.noData(props)) {
      return false;
    }

    this.draw(props, false);
  }

  update(props) {
    if (this.noData(props)) {
      return false;
    }

    this.draw(props, true);
  }

  noData(props) {
    return !props.data || props.data.length === 0;
  }

  draw(props, clear) {
    // Get steps as nodes
    var nodes = props.data.slice(); // Creates deep copy
    var lastNode = {
      step: nodes.length + 1,
      name: "Complete"
    };
    nodes.push(lastNode);

    // Calc distances between nodes
    const xdist = width / nodes.length + 1;

    // Create node locations
    nodes.map(function(d) {
      d["x"] = (d.step - 0.5) * xdist;
      d["y"] = height / 3;
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

    if (clear) {
      this.svg.selectAll("*").remove();
    }

    // Draw links
    var link = this.svg
      .selectAll(".link")
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
      .selectAll(".node")
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
            return nodeColorIncomplete;
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
            this.setAttribute("stroke", nodeColorIncomplete);
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
  }
}

module.exports = BasicProcess;
