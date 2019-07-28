var WIDTH = 1000, HEIGHT = 600; 

function renderStateBarChart(svgId) {
    var svg = d3.select(svgId)
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);
    margin = {
      top: 120,
      right: 20,
      bottom: 130,
      left: 50
    };
    width = +svg.attr("width") - margin.left - margin.right;
    height = +svg.attr("height") - margin.top - margin.bottom;
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    duration = 3000;
    
    var x = d3.scaleBand()
          .rangeRound([0, width])
          .padding(0.1);
    var dataState = [];
    var y = d3.scaleLinear()
          .rangeRound([height, 0]);
    const data =  d3.csv('data/markets.csv').then(function(data) {
        console.log(data);

        dataState = d3.nest()
          .key(function(d) { return d.State; })
          .rollup(function(v) { return v.length; })
          .entries(data);
        console.log(dataState);
        x.domain(dataState.map(function (d) {
            return d.key;
          }));
        y.domain([0, d3.max(dataState, function (d) {
                return d.value;
            })]);
        g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".95em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

        g.append("g")
          .call(d3.axisLeft(y))
          .append("text")
          .attr("fill", "#000")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .text("Markets");

        g.selectAll(".bar")
          .data(dataState)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function (d) {  return x(d.key);  })
          .attr("width", x.bandwidth())          
          .attr("y", height)
          .attr("height", 0)
          .transition()
          .duration(duration)
          .attr("y", function (d) {  return y(d.value); })
          .attr("height", function (d) {  return height - y(d.value); });
          
        });
    }
    renderStateBarChart('#state-bar-chart-svg');