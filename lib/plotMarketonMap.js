
function renderUSMap(svgId) {
  var marketData = d3.csv('data/markets.csv').then(function (marketData) {
    console.log(marketData);
    var mapWIDTH = 1000, mapHEIGHT = 700;
    var margin = { top: 40, right: 20, bottom: 50, left: 70 },
      width = mapWIDTH - margin.left - margin.right,
      height = mapHEIGHT - margin.top - margin.bottom;
    var svg = d3.select(svgId).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    console.log("svg: " + svg + " svg width: " + svg.style("width") + " svg height: " + svg.style("height"));

    //format the data by state and number of markets
    marketDataState = d3.nest()
      .key(function (d) { return d.State; })
      .rollup(function (v) { return v.length; })
      .entries(marketData);
    // Create Tooltips
    var tip = d3.tip().attr('class', 'd3-tip')
      .html(function (usMapDataForAState) {
        var stateData = fetchAStateData(usMapDataForAState);
        var marketCount = 0
        if (stateData && stateData.length > 0) {
          marketCount = stateData[0].value;
        }
        var content = "<span style='margin-left: 2.5px;'><h6>State : " + usMapDataForAState.properties.name + "</h6></span><br>";
        content += "<span style='margin-left: 2.5px;'><h6>No.Of Open Markets : " + marketCount + "</h6></span><br>";
        return content;
      });
    svg.call(tip);
    //Setting geoPath
    var path = d3.geoPath();

    //Creating legend for maps

    var log = d3.scaleLog()
      .domain([1, 100, 1000])
      .range(["rgb(0, 0, 0)", "rgb(120, 166, 255)"]);

    svg.append("g")
      .attr("class", "legendLog")
      .attr("transform", "translate(20,20)");

    var logLegend = d3.legendColor()
      .cells([10, 50, 100, 500, 1000])
      .scale(log);

    svg.select(".legendLog")
      .call(logLegend);

    d3.json("data/us-10m.v2.json").then(function (us) {
      var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      g.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("fill", function (usMapDataForAState) {
          //console.log(d.properties.name);
          var stateData = fetchAStateData(usMapDataForAState);
          if (stateData && stateData.length > 0) {
            return log(stateData[0].value);
          }
          return d3.rgb(77, 166, 255);
        })
        .attr("d", path)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);;

      g.append("path")
        .attr("class", "state-borders")
        .attr("d", path(topojson.mesh(us, us.objects.states, function (a, b) {
          return a !== b;
        })));
    });


  });

}


renderUSMap("#map-svg");


function fetchAStateData(usMapDataForAState) {
  return marketDataState.filter(marketDataStateItem => marketDataStateItem.key.toUpperCase() == usMapDataForAState.properties.name.toUpperCase());
}

