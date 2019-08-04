var WIDTH = 1000, HEIGHT = 600;

function renderMarketCountLineChart(svgId) {
    var svg = d3.select(svgId)
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);
    const margin = {
        top: 120,
        right: 20,
        bottom: 130,
        left: 80
    };

    var width = +svg.attr("width") - margin.left - margin.right;
    var height = +svg.attr("height") - margin.top - margin.bottom;
    const data = d3.csv('data/marketByYears.csv').then(function (data) {
        data.forEach(function (d) {
            d.Year = +d.Year;
            d.Markets = +d.Markets;
        });
        // The number of datapoints
        var n = data.lenght;

        var x = d3.scaleBand()
            .range([0, width]);

        var y = d3.scaleLinear()
            .range([height, 0]);
        x.domain(data.map(function (d) {
            return d.Year;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.Markets;
        })]);
        var line = d3.line()
            .x(function (d, i) {
                return x(d.Year);
            })
            .y(function (d) {
                return y(d.Markets);
            })
            .curve(d3.curveMonotoneX)

        // Create Tooltips
        var tip = d3.tip().attr('class', 'd3-tip')
            .html(function (d) {
                var content = "<span style='margin-left: 2.5px;'>No.Of Markets : <b style='color:lightblue'>" + d.Markets + "</b></span><br>";
                content += "<span style='margin-left: 2.5px;'>Year : <b style='color:lightblue'>" + d.Year + "</b></span><br>";
                return content;
            });
        svg.call(tip);
        //Listing the annotations
        var annotations = [{
            note: {
                align: "right",
                label: "Start of Recession",
                title: "2008"
            },
            x: 405 + margin.left, y: 120 + margin.bottom * 0.25,
            dy: -20,
            dx: 0
        }, {
            note: {
                align: "left",
                label: "End of Recession",
                title: "2012"
            },
            x: 543 + margin.left, y: margin.bottom * 0.25,
            dy: -30,
            dx: 0
        }];
        //Create groups to transform
        var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "middle");
        svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 40) + ")")
            .style("text-anchor", "middle")
            .attr("dy", "1em")
            .attr("font-size", "16")
            .text("Year");
        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("font-size", "16")
            .text("No. Of Markets");

        g.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", line);

        g.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", function (d, i) { return x(d.Year) })
            .attr("cy", function (d) { return y(d.Markets) })
            .attr("r", 5)
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);
        var makeAnnotations = d3.annotation()
            .editMode(false)
            .type(d3.annotationCalloutElbow)
            .annotations(annotations);
        g.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);
    });
}

renderMarketCountLineChart("#market-count-line-chart-svg");
