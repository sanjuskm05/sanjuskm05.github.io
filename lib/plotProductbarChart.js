var WIDTH = 1000, HEIGHT = 600; 
var filterValueOfState;
var filterData;
var filterDataState;
function renderProductBarChart(svgId) {
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
    const data =  d3.csv('data/markets.csv').then(function(data) {
        console.log(data);

        if(filterValueOfState) {
          filterData = data.filter(function(d) {
            return d.State == filterValueOfState;
          });
        } 
        //format the data by state and number of markets
        dataState = d3.nest()
          .key(function(d) { return d.State; })
          .rollup(function(v) { return v.length; })
          .entries(data);
        //Populate state data in select
        d3.select("#states-list").selectAll('option .values')
                      .data(dataState)
                      .enter()
                      .append("option")
                      .attr("value", function(d){ return d.key; })
                      .text(function (d) { return d.key; });
        if(filterData) {
          filterDataState =  d3.nest()
              .key(function(d) { return d.State; })
              .rollup(function(v) { return v.length; })
              .entries(filterData);
        } else {
          filterDataState = dataState;
        }
        //Load products csv
        const productData =  d3.csv('data/products.csv').then(function(productData) {
          if(filterValueOfState) {
              productData = productData.filter(function(d) {
              var fmid = d.FMID;
              return filterData.filter(d => d.FMID == fmid).length > 0;
            });
          }
          var filteredProductDataForPlot = [];
          console.log(productData);
          if(productData[0]) {
            productList = Object.keys(productData[0]).filter(d => d != "FMID");
            productList.forEach(element => {
              filteredProductDataForPlotCount = d3.nest()
                .key(function(d) { 
                  return d[element]; 
                })
                .rollup(function(v) { 
                  return v.length; 
                })
                .entries(productData);
              var yesValueArray = filteredProductDataForPlotCount.filter(d => d.key == 'Y');
              var yesValue = yesValueArray[0] ? yesValueArray[0].value : 0;
              var item = {
                key: element,
                value: yesValue
              };
              filteredProductDataForPlot.push(item);
            });
            
            console.log(filteredProductDataForPlot);
          }
          //Place it in x -y domain
          x.domain(filteredProductDataForPlot.map(function (d) {
            return d.key;
          }));
          y.domain([0, d3.max(filteredProductDataForPlot, function (d) {
                  return d.value;
              })]);
          // Create Tooltips
          var tip = d3.tip().attr('class', 'd3-tip')
              .html(function(d) {
                  var content = "<span style='margin-left: 2.5px;'>" + d.value + "</span><br>";
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
            .data(filteredProductDataForPlot)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {  return x(d.key);  })
            .attr("width", x.bandwidth())          
            .attr("y", height)
            .attr("height", 0);
          bars.transition()
            .duration(duration)
            .attr("y", function (d) {  return y(d.value); })
            .attr("height", function (d) {  return height - y(d.value); });
          bars.on('mouseover', tip.show)
            .on('mouseout', tip.hide);
        });
        if(filterValueOfState) {
          var table = d3.select('#product-table-chart-svg')
                    .append("table")
                    .attr("class", "table")
                    .attr("width", WIDTH)
                    .attr("height", HEIGHT);
          var thead = table.append('thead');
          var tbody = table.append('tbody');
          var columns = Object.keys(filterData[0]);
          thead.append('tr')
            .selectAll('th')
              .data(columns)
              .enter()
            .append('th')
              .text(function (d) { return d });

          var rows = tbody.selectAll('tr')
              .data(filterData)
              .enter()
            .append('tr');

          var cells = rows.selectAll('td')
              .data(function(row) {
                return columns.map(function (column) {
                  return { column: column, value: row[column] }
                })
              })
              .enter()
            .append('td')
              .text(function (d) { return d.value });
          }
        
        });
    }

    function onStateValueChange() {
      filterValueOfState = d3.select('#states-list').property('value');
      console.log('changed ' + filterValueOfState);
      var svgId = '#product-bar-chart-svg';
      d3.select(svgId).select("svg").remove();
      d3.select('#product-table-chart-svg').select('table').remove();
      renderProductBarChart(svgId);
    }
    renderProductBarChart('#product-bar-chart-svg');