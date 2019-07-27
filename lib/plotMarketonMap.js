// Start Global Variables Definition
var WIDTH = 1960, HEIGHT = 600; 
var marketData = null;
// End Global Variables Definition
async function init() {
    marketData = await d3.csv('data/markets.csv');

    console.log("in init");
}

async function renderUSMap(svgId) {
    marketData = await d3.csv('https://github.com/sanjuskm05/sanjuskm05.github.io/blob/master/data/markets.csv');
    console.log(marketData);
    var margin = {top: 40, right: 20, bottom: 50, left: 70},
      width = WIDTH  - margin.left - margin.right,
      height = HEIGHT - margin.top - margin.bottom;
    var svg = d3.select(svgId).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    console.log("svg: " + svg + " svg width: " + svg.style("width") + " svg height: " + svg.style("height"));
    //var svg = d3.select("svg");

    var path = d3.geoPath();
    
    d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
      if (error) throw error;
    
      svg.append("g")
          .attr("class", "states")
          .attr("fill", "grey")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
          .attr("d", path);
    
      svg.append("path")
          .attr("class", "state-borders")
          .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
    });

    // setup x 
    var xValue = function(d) { return d.x;}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
    var yValue = function(d) { return d.y;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

    // draw dots
    svg.selectAll(".dot")
    .data(data)
        .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 3.5)
    .attr("cx", xMap)
    .attr("cy", yMap)
    .style("fill", "blue") ;
}


renderUSMap("#map-svg");


