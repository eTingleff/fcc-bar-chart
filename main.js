(function() {
  'use strict';

const URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

const chart = "#chart-container";

const W = 1000;
const H = 600;
const PADDING = 25;

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

function generateChart(chartData) {
  const dataset = chartData.data;

  const startDate = new Date(dataset[0][0]);
  const endDate = new Date(dataset[dataset.length - 1][0]);

  const xScale = d3.scaleTime()
                  .domain([startDate, endDate])
                  .range([PADDING, W - PADDING])
                  .nice();

  const yScale = d3.scaleLinear()
                  .domain([0, d3.max(dataset, (d) => d[1])])
                  //.range([H - PADDING, PADDING * 2]) // ([H - PADDING, PADDING])?
                  .range([H - PADDING, PADDING])
                  .nice();

  const svg = d3.select(chart)
                .append('svg')
                  .attr('width', W)
                  .attr('height', H);

  const xAxis = d3.axisBottom().scale(xScale);
  const yAxis = d3.axisLeft().scale(yScale);

  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${H - PADDING})`) // translate(${PADDING}, ${H})?
    .call(xAxis);

  svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(0, ${0 - PADDING})`)
    .call(yAxis);

  const tooltip = d3.select(chart)
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);
  

  svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
      .attr("class", "bar")
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .attr("x", (d) => xScale(new Date(d[0])))
      .attr("y", (d) => yScale(d[1]) - PADDING) // Shouldn't it just be yScale(d[1])?
      .attr("width", ((W - PADDING * 2) / dataset.length) * .5)
      .attr("height", (d) => H - yScale(d[1]) - PADDING)
      .attr("fill", "purple")
      .on("mouseover", function(d) {
        tooltip.transition()
          .duration(0)
          .style("opacity", 1)
          .style("background", "pink")
          .text(d[0] + " " + d[1]);
        tooltip.attr("data-date", d[0]);
      })
      .on("mouseout",  function(d) {
        tooltip.transition()
          .duration(0)
          .style("opacity", 0)
      })

}

})()