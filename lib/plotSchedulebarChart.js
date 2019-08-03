var WIDTH = 1000, HEIGHT = 600;
var filterValueOfMonth = [];
var filterData;
var filterDataState;
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function renderScheduleBarChart(svgId) {
  var svg = d3.select(svgId)
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);
  const margin = {
    top: 120,
    right: 20,
    bottom: 130,
    left: 50
  };
  var width = +svg.attr("width") - margin.left - margin.right;
  var height = +svg.attr("height") - margin.top - margin.bottom;
  var duration = 1000;

  var x = d3.scaleBand()
    .rangeRound([0, width])
    .padding(0.1);
  var dataState = [];
  var y = d3.scaleLinear()
    .rangeRound([height, 0]);
  //Load market csv
  const data = d3.csv('data/markets.csv').then(function (data) {

    //Load schedule csv
    const scheduleData = d3.csv('data/schedule.csv').then(function (scheduleData) {
      if (filterValueOfMonth.length > 0) {
        scheduleData = scheduleData.filter(scheduleItem => isMarketOpen(scheduleItem.seasonOpenning, scheduleItem.seasonClosing));
        data = data.filter(d => scheduleData.filter(scheduleItem => scheduleItem.FMID == d.FMID).length > 0);
      }

      //format the data by state and number of markets
      dataState = d3.nest()
        .key(function (d) { return d.State; })
        .rollup(function (v) { return v.length; })
        .entries(data);
      //Place it in x -y domain
      x.domain(dataState.map(function (d) {
        return d.key;
      }));
      y.domain([0, d3.max(dataState, function (d) {
        return d.value;
      })]);
      // Create Tooltips
      var tip = d3.tip().attr('class', 'd3-tip')
        .html(function (d) {
          var content = "<span style='margin-left: 2.5px;'><h8>State : <b style='color:lightblue'>" + d.key + "</b></h8></span><br>";
          content += "<span style='margin-left: 2.5px;'><h8>No. Of markets: <b style='color:lightblue'>" + d.value + "</b></h8></span><br>";
          return content;
        });
      svg.call(tip);
      //Create groups to transform
      var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
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
        .text("No. Of Markets");

      var bars = g.selectAll(".bar")
        .data(dataState)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.key); })
        .attr("width", x.bandwidth())
        .attr("y", height)
        .attr("height", 0);
      bars.transition()
        .duration(duration)
        .attr("y", function (d) { return y(d.value); })
        .attr("height", function (d) { return height - y(d.value); });
      bars.on('mouseover', tip.show)
        .on('mouseout', tip.hide);
    });

  });
}

function onMonthChange() {
  filterValueOfMonth = [];
  months.forEach(d => {
    var item = {
      key: d,
      value: d3.select('#check' + d).property('checked')
    };
    filterValueOfMonth.push(item);
  });
  filterValueOfMonth = filterValueOfMonth.filter(d => d.value);
  // console.log('changed ' + filterValueOfState);
  var svgId = '#schedule-bar-chart-svg';
  d3.select(svgId).select("svg").remove();
  renderScheduleBarChart(svgId);
}
renderScheduleBarChart('#schedule-bar-chart-svg');

function isMarketOpen(givenMonthOpenning, givenMonthClosing) {
  if (!givenMonthOpenning && givenMonthClosing)
    givenMonthOpenning = givenMonthClosing;
  if (!givenMonthClosing && givenMonthOpenning)
    givenMonthClosing = givenMonthOpenning;
  for (var d of filterValueOfMonth) {
    var convertedGivenMonth = months.indexOf(d.key);
    var convertedOpenningMonth = months.indexOf(givenMonthOpenning.trim());
    var convertedClosingMonth = months.indexOf(givenMonthClosing.trim());
    if (convertedOpenningMonth > convertedClosingMonth) {
      convertedClosingMonth = months.length + convertedClosingMonth;
      convertedGivenMonth = months.length + convertedGivenMonth;
    }
    if (convertedOpenningMonth <= convertedGivenMonth && convertedGivenMonth <= convertedClosingMonth) {
      return true;
    }
  }
  return false;
}