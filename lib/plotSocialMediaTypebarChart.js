var WIDTH = 450, HEIGHT = 600;
var filterValueOfState;
var filterData;
var filterDataState;
function renderSocialMediaTypeBarChart(svgId) {
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
  const data = d3.csv('data/markets.csv').then(function (data) {
    console.log(data);

    if (filterValueOfState) {
      filterData = data.filter(function (d) {
        return d.State == filterValueOfState;
      });
    } else {
      filterData = data;
    }
    //format the data by state and number of markets
    dataState = d3.nest()
      .key(function (d) { return d.State; })
      .rollup(function (v) { return v.length; })
      .entries(data);
    //Populate state data in select
    d3.select("#states-list").selectAll('option .values')
      .data(dataState)
      .enter()
      .append("option")
      .attr("value", function (d) { return d.key; })
      .text(function (d) { return d.key; });
    if (filterData) {
      filterDataState = d3.nest()
        .key(function (d) { return d.State; })
        .rollup(function (v) { return v.length; })
        .entries(filterData);
    } else {
      filterDataState = dataState;
    }

    //Load socail media csv
    const socialMediaData = d3.csv('data/socialMedia.csv').then(function (socialMediaData) {
      if (filterValueOfState) {
        socialMediaData = socialMediaData.filter(function (d) {
          var fmid = d.FMID;
          return filterData.filter(d => d.FMID == fmid).length > 0;
        });
      }
      var socialMediaDataForPlot = [];

      if (socialMediaData[0]) {
        socialMediaTypeList = Object.keys(socialMediaData[0]).filter(d => d != "FMID");
        socialMediaTypeList.forEach(element => {
          socialMediaDataForPlotCount = d3.nest()
            .key(function (d) {
              return d[element] != '' ? 'Y' : 'N';
            })
            .rollup(function (v) {
              return v.length;
            })
            .entries(socialMediaData);
          var yesValueArray = socialMediaDataForPlotCount.filter(d => d.key == 'Y');
          var yesValue = yesValueArray[0] ? yesValueArray[0].value : 0;
          var item = {
            key: element,
            value: yesValue
          };
          var item = {
            key: element,
            value: yesValue
          };
          socialMediaDataForPlot.push(item);
        });
        var noSocialCount = filterData.length - socialMediaData.length;

        socialMediaDataForPlot.push({
          key: 'No social Media',
          value: noSocialCount
        })
      }
      //Place it in x -y domain
      x.domain(socialMediaDataForPlot.map(function (d) {
        return d.key;
      }));
      y.domain([0, d3.max(socialMediaDataForPlot, function (d) {
        return d.value;
      })]);
      // Create Tooltips
      var tip = d3.tip().attr('class', 'd3-tip')
        .html(function (d) {
          var content = "<span style='margin-left: 2.5px;'><h8>Spcial Media type: <b style='color:lightblue'>" + d.key + "</b></h8></span><br>";
          content += "<span style='margin-left: 2.5px;'><h8>No.Of Markets has it: <b style='color:lightblue'>" + d.value + "</b></h8></span><br>";

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
      //Listing the annotations
      var annotations = [{
        note: {
          align: "right",
          label: "Scope for Social Media marketing. Total 2528 markets",
          title: "Opportunities"
        },
        x: 300 + margin.left, y: margin.bottom - 1 * 0.25,
        dy: -20,
        dx: 0
      }];


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
        .data(socialMediaDataForPlot)
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
      var makeAnnotations = d3.annotation()
        .editMode(false)
        .type(d3.annotationCalloutElbow)
        .annotations(annotations);
      g.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations);
    });

  });
}

function onStateValueChange() {
  filterValueOfState = d3.select('#states-list').property('value');
  console.log('changed ' + filterValueOfState);
  var svgId = '#social-bar-chart-svg';
  d3.select(svgId).select("svg").remove();
  renderSocialMediaTypeBarChart(svgId);
}
renderSocialMediaTypeBarChart('#social-bar-chart-svg');