(function() {
'use strict';

const URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

const chart = "#chart-container";

const W = 800;
const H = 500;
const PADDING = 50;

getChartData();

function getChartData() {
  const req = new XMLHttpRequest();
  req.open('GET', URL);
  req.send();
  req.onload = function() {
    const json = JSON.parse(req.responseText);
    console.log(json);
    generateChart(json);
  }
}

function getTooltipPosition(coords) {
  let posObj = { };

  if (coords[0] + 160 > W) {
    posObj.rectX = coords[0] - 160;
    posObj.textX = coords[0] - 150;
  } else {
    posObj.rectX = coords[0] + 10;
    posObj.textX = coords[0] + 20;
  }

  if (coords[1] - 85 < 0) {
    posObj.rectY = coords[1] + 10;
    posObj.dateTextY = coords[1] + 35;
    posObj.gdpTextY = coords[1] + 65;
  } else {
    posObj.rectY = coords[1] - 85;
    posObj.dateTextY = coords[1] - 60;
    posObj.gdpTextY = coords[1] - 30;
  }

  return posObj;
}

function getFinancialQuarter(date) {
  let month = date.split("-");
  let year = month[0];
  let monthNum = +month[1];
  switch (monthNum) {
    case 1:
      return `Q1 ${year}`
    case 4:
      return `Q2 ${year}`
    case 7:
      return `Q3 ${year}`
    case 10:
      return `Q4 ${year}`
  }
}

function prettyfyGDP(val) {
  let stringInt = val.toFixed(1).split(".")[0];
  let stringArr = val.toFixed(1).split("");
  
  let prettyfied;
  if (stringInt.length > 3) {
    if (stringInt.length < 5) {
      stringArr.splice(1, 0, ",");
      prettyfied = `$${stringArr.join("")} Billion`;
    } else if (stringInt.length < 6) {
      stringArr.splice(2, 0, ",");
      prettyfied = `$${stringArr.join("")} Billion`
    } else if (stringInt.length < 7) {
      stringArr.splice(3, 0, ",");
      prettyfied = `$${stringArr.join("")} Billion`
    }
    return prettyfied;
  } else {
    return `$${val.toFixed(1)} Billion`;
  }
}

function generateChart(chartData) {
  const dataset = chartData.data;

  const startDate = new Date(dataset[0][0]);
  const endDate = new Date(dataset[dataset.length - 1][0]);

  const xScale = d3.scaleTime()
                  .domain([startDate, endDate])
                  .range([PADDING, W - PADDING]);

  const yScale = d3.scaleLinear()
                  .domain([0, d3.max(dataset, (d) => d[1])])
                  .range([H - PADDING, PADDING]);

  const svg = d3.select(chart)
                .append('svg')
                  .attr('width', W)
                  .attr('height', H);

  const xAxis = d3.axisBottom().scale(xScale);
  const yAxis = d3.axisLeft().scale(yScale);

  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(${0}, ${H - PADDING})`)
    .call(xAxis);

  svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${PADDING}, ${0})`)
    .call(yAxis);

  svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
      .attr("class", "bar")
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .attr("x", (d) => xScale(new Date(d[0])))
      .attr("y", (d) => yScale(d[1]))
      .attr("width", (W - PADDING) / dataset.length)
      .attr("height", (d) => (H - PADDING) - yScale(d[1]))
      .attr("fill", "slategray")
      .on("mouseenter", function(d, i) {
        let coords = getTooltipPosition(d3.mouse(this));
        
        d3.select(this)
          .attr("fill", "crimson");

        svg.append("g")
          .attr("id", "tooltip")
          .attr("data-date", d[0])
          .attr("x", (d, i) => coords.rectX)
          .attr("y", (d, i) => coords.rectY);
            
        d3.select("#tooltip")
          .append("rect")
            .attr("x", (d, i) => coords.rectX)
            .attr("y", (d, i) => coords.rectY)
            .attr("width", 150)
            .attr("height", 75)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", "rgba(0, 0, 0, .7)");

        d3.select("#tooltip")
          .append("text")
            .attr("x", coords.textX)
            .attr("y", coords.dateTextY)
            .attr("fill", "white")
            .text(getFinancialQuarter(d[0]));

        d3.select("#tooltip")
          .append("text")
            .attr("x", coords.textX)
            .attr("y", coords.gdpTextY)
            .attr("fill", "white")
            .text(prettyfyGDP(d[1]));
      })
      .on("mouseleave",  function(d, i) {
        d3.select(this)
          .attr("fill", "slategray")
        let tooltip = svg.select("#tooltip");
        tooltip.remove();
      });

}

})()