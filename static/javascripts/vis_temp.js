

// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the SVG object to the body of the page
var SVG = d3.select("#dataviz_axisZoom")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv", function(data) {

  // Add X axis
  var x = d3.scaleLinear()
    .domain([4, 8])
    .range([ 0, width ]);
  var xAxis = SVG.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 9])
    .range([ height, 0]);
  var yAxis = SVG.append("g")
    .call(d3.axisLeft(y));

  // Add a clipPath: everything out of this area won't be drawn.
  var clip = SVG.append("defs").append("SVG:clipPath")
      .attr("id", "clip")
      .append("SVG:rect")
      .attr("width", width )
      .attr("height", height )
      .attr("x", 0)
      .attr("y", 0);

  // Create the scatter variable: where both the circles and the brush take place
  var scatter = SVG.append('g')
    .attr("clip-path", "url(#clip)")

  // Add circles
  scatter
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.Sepal_Length); } )
      .attr("cy", function (d) { return y(d.Petal_Length); } )
      .attr("r", 8)
      .style("fill", "#61a3a9")
      .style("opacity", 0.5)

  // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
  var zoom = d3.zoom()
      .scaleExtent([.5, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
      .extent([[0, 0], [width, height]])
      .on("zoom", updateChart);

  // This add an invisible rect on top of the chart area. This rect canr pointer events: necessary to recove understand when the user zoom
  SVG.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .call(zoom);
  // now the user can zoom and it will trigger the function called updateChart

  // A function that updates the chart when the user zoom and thus new boundaries are available
  function updateChart() {

    // recover the new scale
    var newX = d3.event.transform.rescaleX(x);
    var newY = d3.event.transform.rescaleY(y);

    // update axes with these new boundaries
    xAxis.call(d3.axisBottom(newX))
    yAxis.call(d3.axisLeft(newY))

    // update circle position
    scatter
      .selectAll("circle")
      .attr('cx', function(d) {return newX(d.Sepal_Length)})
      .attr('cy', function(d) {return newY(d.Petal_Length)});
  }

});


//draw selected patient rect
/*for(var i = 0; i < admData.length; i++){
    diagData = new Object();
    diagList = admData[i].diag_code.split('; ');
    diagNameList = admData[i].short_diag_name.split('; ');
    for(var k = 0; k < diagList.length; k++){
        diagData[diagList[k]] = diagNameList[k];
    }
    rectData = d3.keys(diagData);
    rectX = xOrdinalScale(i);
    var diagIndex = Array.from(Array(diagList.length).keys());
    var rectScale = d3.scaleLinear()
        .domain([d3.min(diagIndex), d3.max(diagIndex)])
        .range([300, 0]);
    var height = 300 / diagList.length - 5;
    //console.log(height);

    var rects = svg.selectAll('g')
        .data(rectData)
        .enter()
        .append('rect')
        .attr('id', function(d, i){
            return "rect" + d;
        })
        .attr('x', function (d, i) {
            return rectX - 15;
        })
        .attr('y', function (d, i) {
            // console.log(rectScale(i));
            // return rectScale(i);
            //console.log((15+3) * i);
            return 280 - 15*i;
        })
        .style("fill", "#2980b9")
        .attr("height", 12)
        .attr("width", 30)
        .attr("transform", "translate(0,0)")
}*/

var graph = {
        "nodes": [
            {
                "name": "Dignosis",
                "label": "1",
                "id": 1
            },
            {
                "name": "Dignosis",
                "label": "2",
                "id": 2
            },
            {
                "name": "Dignosis",
                "label": "3",
                "id": 3
            },
            {
                "name": "Dignosis",
                "label": "4",
                "id": 4
            }
        ],
        "links": [
            {
                "source": 1,
                "target": 2,
                "type": "Cause",
                "since": 2010
            },
            {
                "source": 1,
                "target": 3,
                "type": "Caused by"
            },
            {
                "source": 2,
                "target": 3,
                "type": "Cause"
            },
            {
                "source": 3,
                "target": 4,
                "type": "Cause"
            }
        ]
    };

//region render negative codes
    /*
    svg.selectAll('negBar')
        .data(sinPtData.sort_keys)
        .enter()
        .append("g")
        .selectAll('negrect')
        .data(function (d, i) {
            var codes = d3.keys(ptPredData[0][p_id][d]);
            var codes = codes.filter(function (x) {
                return ptPredData[0][p_id][d][x][0] < 0;
            });
            var codeObj = arrToObject(codes, d, i);
            return codeObj;
        })
        .enter()
        .append('rect')
        .attr('class', 'codebox')
        .attr('id', function (d, i, j) {
            return "id_code_posi" + d.code;
        })
        .attr('x', function (d, i) {
            return xOrdinalScale(d.visit_index) - visit_box_width / 2 + code_icon_size * i + 10;
        })
        .attr('y', function (d, i) {
            var code_val = Math.abs(ptPredData[0][p_id][d.visit][d.code][0]);
            return visit_box_y + 30;
        })
        .style("fill", "#e0e0e0")
        .attr("stroke", "black")
        .style("stroke-width", 0.5)
        .attr("height", function (d, i) {
            var code_val = Math.abs(ptPredData[0][p_id][d.visit][d.code][0]);
            return 40 * code_val / 1;
        })
        .attr("width", 5)
        .attr("transform", "translate(0,0)");
    //endregion

    */

    // endregion


/* d3 pie chart

    //legend
    var legend = d3.select("#race-chart").append("svg")
        .attr("class", legend)
        .attr("width", 120)
        .attr("heitht", radius * 2)
        .selectAll("g")
        .data(color.domain()).enter()
        .append("g")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")  //Using dy=0.35em can help vertically centre text regardless of font size
        .text(function (d) {
            return d;
        })

    var pieSvg = d3.select("#race-chart")
        .append("svg")
        .attr("class", "pieSvg")
        .attr("width", 150)
        .attr("height", 150)
		.append("g")
        .attr("transform", "translate(" + 60 + "," + 60 + ")");

    // Generate the pie
    var pie = d3.pie()
		.value(function (d) {
			return d.value;

		});

    // generate the arcs
    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    pieSvg.selectAll('.arc')
		.data(pie(d3.entries(data.raceSum)))
		.enter()
		.append("path")
		.attr("class","arc")
		.attr('d', arc)
		.style("fill",function (d) {
			return color(d.data.key);
		})

	*/

/**
 * render single patient's history
 * @param p_id: patient id
 */
function render_history(p_id, sinPtData, ptPredData) {

    console.log(sinPtData, ptPredData);

    //region button events
    d3.selectAll(".code-tree").remove();
    d3.selectAll(".kg-network").remove();

    $('#contri-btn').unbind('click').click(function () {
    });
    $("#contri-btn").click(function () {
        cleanVis();
        render_history(p_id, sinPtData, ptPredData);
    });

    $('#detail-btn').unbind('click').click(function () {
    });
    $("#detail-btn").click(function () {
        cleanVis();
        renderTemporal(p_id, sinPtData, ptPredData);
    });

    $('#reset-btn').unbind('click').click(function () {
    });
    $("#reset-btn").click(function () {
        resetHistory();
    });

    $('#remove-btn').unbind('click').click(function () {
    });
    $("#remove-btn").click(function () {
        updateCode(sinPtData, ptPredData, 0); //remove code
    });

    $('#add-btn').unbind('click').click(function () {
    });
    $("#add-btn").click(function () {
        updateCode(sinPtData, ptPredData, 0); //remove code
    });


    //endregion

    // region params and data transformation

    var width = 1100,
        height = 230,
        margin = 20;

    // x axis scale: each tick represent a visit, uniform distributed.

    var xDomain = Array.from(Array(Object.keys(sinPtData.admission).length).keys());
    xDomain.push(xDomain.length);
    xDomain.unshift(-1);

    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(xDomain), d3.max(xDomain)])
        .range([margin, width - margin]);

    var xRange = xDomain.map(x => xLinearScale(x));

    var xOrdinalScale = d3.scaleOrdinal()
        .domain(xDomain)
        .range(xRange);

    // y axis scale: for risk predict line chart
    var pred_res_time = Object.values(ptPredData[1][p_id]).map(x => +x);
    var pred_res_time_max = d3.max(pred_res_time) + d3.max(pred_res_time) * 0.1;
    var pred_res_time_min = d3.min(pred_res_time) - d3.min(pred_res_time) * 0.1;

    var yLineScale = d3.scaleLinear()
        .domain([pred_res_time_min, pred_res_time_max])
        .range([80, 0]);

    var zoom = d3.zoom()
        .scaleExtent([0.1, 200])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    // endregion

    var svg = d3.select('#model-box').append("svg")
        .attr("id", function (d, i) {
            return "svg_history";
        })
        .attr("class", "svg")
        .attr("width", width + 20)
        .attr("height", height)
        .on("click", () => {
            d3.selectAll(".code-tree").remove();
            d3.selectAll(".kg-network").remove();
        })
        .call(zoom)
        .append("g")
        .attr("transform",
            "translate(" + 20 + "," + 0 + ")");


    //region contribution box

    var visit_cont = Object.values(ptPredData[3][p_id]).map(x => +x);
    // console.log(visit_cont);
    var visit_cont_max = d3.max(visit_cont) + d3.max(visit_cont) * 0.5;
    var visit_cont_min = d3.min(visit_cont) - d3.min(visit_cont) * 0.5;

    var colorScalePos = d3.scaleSequential(d3.interpolateReds)
        .domain([0, visit_cont_max]);
    var colorScaleNeg = d3.scaleSequential(d3.interpolateBlues)
        .domain([visit_cont_min, 0]);


    var visit_box_height = 20;
    let num_visit = sinPtData.sort_keys.length;
    var visit_box_width = 1000 / 60;
    var visit_box_y = 180;

    var visit_cont_box = svg.selectAll('contri_rect')
        .data(sinPtData.sort_keys)
        .enter()
        .append('rect')
        .attr('class', 'cont_box')
        .attr('id', function (d, i) {
            return "visit_box" + d;
        })
        .attr('x', function (d, i) {
            return xOrdinalScale(i) - visit_box_width / 2 + 10;
        })
        .attr('y', function (d, i) {
            return visit_box_y;
        })
        .style("fill", function (d, i) {
            let visit_val = ptPredData[3][p_id][d];
            if (visit_val >= 0)
                return colorScalePos(visit_val);
            else
                return colorScaleNeg(visit_val);
        })
        .attr("stroke", "black")
        .style("stroke-width", 1)
        .attr('cursor', 'pointer')
        .on('click', function (e) {
            d3.event.stopPropagation();
            let visit_id = d3.select(this).attr('id').slice(9);
            let codeData = stratifyData(ptPredData[0][p_id][visit_id], p_id);
            let code_length = codeData.children.length;
            let code_div_height = (code_length + 5) * 12 + 50;
            let code_div_width = 270;
            let pos_left = this.getBoundingClientRect().x + 18;
            let select_text = '';
            for (let i = 0; i < drug_list.length; i++) {
                select_text = select_text + "<option value=" +
                    drug_list[i] + ">" + drug_list[i] + "</option>";
            }
            d3.select('#code-tree' + visit_id).remove();
            let html_text = `
                <div class = 'code-tree-title'>
                    code&nbsp;&nbsp;&nbsp;&nbsp;cont&nbsp;&nbsp;&nbsp;&nbsp;kg cont
                </div>
                <div id = 'code-tree-vis${visit_id}' style="width:${code_div_width}px; 
                height: ${code_div_height - 65}px" >
                
                </div>
                <div id="add-code-panel">
                    <br>
                    &nbsp;&nbsp;&nbsp;select a drug:
                    <select id="code-select" class="code-selection">
                        ${select_text}
                    </select>
                    <button type="button" class="viewswitch-btn" id="add-code-btn">Add</button>
                </div>
            `;
            var div = d3.select(".main-box").append("div")
                .attr('pointer-events', 'none')
                .attr('id', 'code-tree' + visit_id)
                .attr("class", "code-tree")
                .style("opacity", 1)
                .html(html_text)
                .style("width", code_div_width + 'px')
                .style("height", code_div_height + 'px')
                .style("left", pos_left + 'px')
                .style("top", (parseFloat(d3.select(this).attr('y')) +
                    parseFloat(460) -
                    parseFloat(code_div_height / 2) - 7.5) + 'px');

            $('#add-code-btn').unbind('click').click(function () {
            });
            $("#add-code-btn").click(function () {
                let e = document.getElementById('code-select');
                let code_name = e.options[e.selectedIndex].value;
                selectedCode[visit_id + '-' + code_name] = 2;
                updateCodeList();
            });
            renderCodeTree(codeData, code_div_height - 65, code_div_width, visit_id);

        })
        .attr("height", visit_box_height)
        .attr("width", visit_box_width - 2)
        .attr("transform", "translate(0,0)");

    // endregion

    // region draw code and knowledgraph
    // params
    var code_icon_size = 10;

    var code_cont = [];
    var code_kg_cont = [];
    Object.keys(ptPredData[0][p_id]).forEach((visit) => {
        Object.keys(ptPredData[0][p_id][visit]).forEach((code) => {
            code_cont.push(+ptPredData[0][p_id][visit][code][0]);
            code_kg_cont.push(+ptPredData[0][p_id][visit][code][1]);
        });
    });
    code_cont_max = d3.max(code_cont) + 0.3 * d3.max(code_cont);
    code_cont_min = d3.min(code_cont) - 0.3 * d3.min(code_cont);

    //use two color scale
    var codeScale = d3.scaleLinear()
        .domain([code_cont_min, code_cont_max])
        .range([165, 110]);

    var kgColorScalePos = d3.scaleSequential(d3.interpolateReds)
        .domain([0, d3.max(code_kg_cont) + 0.5 * d3.max(code_kg_cont)]);
    var kgColorScaleNeg = d3.scaleSequential(d3.interpolateReds)
        .domain([d3.min(code_kg_cont) - 0.5 * d3.min(code_kg_cont), 0]);

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("SVG:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", 65)
        .attr("x", 0)
        .attr("y", 110);

    // Create the scatter variable: where both the circles and the brush take place
    var scatter = svg.append('g')
        .attr("clip-path", "url(#clip)");

    scatter.selectAll('g')
        .data(sinPtData.sort_keys)
        .enter()
        .append("g")
        .selectAll('code_circle')
        .data(function (d, i) {
            var codes = d3.keys(ptPredData[0][p_id][d]);
            var codeObj = arrToObject(codes, d, i);
            return codeObj;
        })
        .enter()
        .append('circle')
        .attr('class', 'codebox')
        .attr('id', function (d, i, j) {
            return "id_code_posi" + d.code;
        })
        .attr('cx', function (d, i) {
            return xOrdinalScale(d.visit_index) + 10;
        })
        .attr('cy', function (d, i) {
            var code_val = ptPredData[0][p_id][d.visit][d.code][0];
            return codeScale(code_val);
        })
        .style("fill", function (d, i) {
            let code_val = ptPredData[0][p_id][d.visit][d.code][0];
            let kg_val = ptPredData[0][p_id][d.visit][d.code][1];
            //console.log(kg_val);
            if (kg_val >= 0) {
                return kgColorScalePos(kg_val);
            } else {
                return kgColorScaleNeg(kg_val);
            }
        })
        .style("cursor", "pointer")
        .on("click", function (d, i) {
            if (ifSelMode) {
                let code_id = d.code;
                let visit_id = d.visit;
                if (selectedCode[visit_id + '-' + code_id]) {
                    selectedCode[visit_id + '-' + code_id] = 0;
                    d3.select(this).attr("stroke", '#e67e22');
                    d3.select(this).style("stroke-width", 1.5);
                    updateCodeList();
                } else {
                    selectedCode[visit_id + '-' + code_id] = 1;
                    d3.select(this).attr("stroke", 'black');
                    d3.select(this).style("stroke-width", 0.5);
                    updateCodeList();
                }
            } else {
                d3.event.stopPropagation();
                d3.select(this).attr("r", 7);
                let code_id = d.code;
                let visit_id = d.visit;
                let code_val = parseFloat(ptPredData[0][p_id][d.visit][d.code][0]).toFixed(3);
                let kg_val = parseFloat(ptPredData[0][p_id][d.visit][d.code][1]).toFixed(3);
                let kg_data = ptPredData[2][p_id][d.visit][d.code];   //knowledge graph data, to be finished
                let kg_div_height = 350;
                let kg_div_width = 320;
                let pos_left = this.getBoundingClientRect().x + 10;
                let pos_top = this.getBoundingClientRect().y - 110;
                d3.select('#kg-network' + visit_id + code_id).remove();
                let title_id = 'kg-network' + visit_id + code_id + '-title';
                var div = d3.select(".main-box").append("div")
                    .attr('pointer-events', 'none')
                    .attr('id', 'kg-network' + visit_id + code_id)
                    .attr("class", "kg-network")
                    .html("<div class='kg-network-title' id=" + title_id + ">Knowledge Graph</div>" +
                        "<p class='kg-net-text'>code: " + code_id + "" +
                        "<br>cont: " + code_val +
                        "<br>kg cont: " + kg_val + "</p>")
                    .style("width", kg_div_width + 'px')
                    .style("height", kg_div_height + 'px')
                    .style("left", pos_left + 'px')
                    .style("top", pos_top + 'px');
                renderKGNetwork(kg_data, 320, 300, code_id, visit_id);
                dragElement(document.getElementById('kg-network' + visit_id + code_id));
            }
        })
        .on("mouseout", function () {
            d3.select(this).attr("r", 3);
        })
        .attr("stroke", "black")
        .style("stroke-width", 0.5)
        .attr("r", 3)
        .attr("transform", "translate(0,0)");

    //endregion

    // region render line chart

    var visit_line = svg.append("path")
        .datum(sinPtData.sort_keys)
        .attr("fill", "none")
        .attr("stroke", "#666666")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .curve(d3.curveMonotoneX)
            .x(function (d, i) {
                return xOrdinalScale(i) + 10;
            })
            .y(function (d, i) {
                var pred_rist = ptPredData[1][p_id][d];
                if (pred_rist.substring(0, 1) == '[')
                    pred_rist = pred_rist.replace('[', '').replace(']', '');
                return yLineScale(pred_rist) + 20;
            })
        );

    var visit_line_points = svg.append("g")
        .selectAll("dot")
        .data(sinPtData.sort_keys)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) {
            return xOrdinalScale(i) + 10;
        })
        .attr("cy", function (d) {
            var pred_rist = ptPredData[1][p_id][d];
            if (pred_rist.substring(0, 1) == '[')
                pred_rist = pred_rist.replace('[', '').replace(']', '');
            return yLineScale(pred_rist) + 20;
        })
        .attr("r", 5)
        .attr("fill", "#666666");
    // endregion

    // region draw code box axis
    // Add scales to axis
    var x_axis = d3.axisBottom()
        .tickFormat(function (d, i) {
            if (i != 0 & i != xRange.length - 1) {
                var a_id = sinPtData.sort_keys[i - 1];
                //return selectedsinPtData.date[a_id].toShortFormat();
                return "v" + i;
            } else
                return 1;
        })
        .scale(xOrdinalScale);

    //Append group and insert axis
    svg.append("g")
        .attr("transform", "translate(10," + (height - 20) + ")")
        .call(x_axis)
        .selectAll("text")
        .attr("x", 0)
        .attr("y", 10)
        // .attr("dy", 20)
        .attr("transform", "rotate(0)");

    var ticks = d3.selectAll(".tick");
    ticks.each(function (_, i) {
        if (i == 0) d3.select(this).remove();
        if (i == xRange.length - 1) d3.select(this).remove();
    });

    var y_axis = d3.axisLeft()
        .scale(codeScale)
        .ticks(5);

    svg.append("g")
        .attr("class", "code_axis")
        .attr("transform", "translate(30, 0)")
        .call(y_axis);
    //endregion

    // region line chart axis
    var x_line_axis = d3.axisBottom()
        .tickFormat("")
        .scale(xOrdinalScale);

    //Append group and insert axis
    //https://stackoverflow.com/questions/19787925/create-a-d3-axis-without-tick-labels
    svg.append("g")
        .attr("transform", "translate(10," + (height - 130) + ")")
        .call(x_line_axis)
        .selectAll("text")
        .attr("x", 0)
        .attr("y", 0)
        // .attr("dy", 20)
        .attr("transform", "rotate(0)");


    var y_line_axis = d3.axisLeft()
        .scale(yLineScale)
        .ticks(5);

    svg.append("g")
        .attr("class", "y_line_axis")
        .attr("transform", "translate(30, 20)")
        .call(y_line_axis);


    // endregion

    //region zoom event
    function zoomed() {
        var newCodeScale = d3.event.transform.rescaleY(codeScale);
        svg.select(".code_axis").call(y_axis.scale(newCodeScale));
        svg.selectAll('.codebox')
            .attr('cy', function (d, i) {
                var code_val = ptPredData[0][p_id][d.visit][d.code][0];
                return newCodeScale(code_val);
            });

    }

    //enable scaling

    //d3.select('#svg-g').call(zoom);

    //endregion


}

/**
 * what if analysis, compute two results
 * @param p_id
 * @param sinPtData
 * @param ptPredData
 * @param oldPredData: old predData
 */
function render_history_comp(p_id, sinPtData, ptPredData, oldPredData, oldSinPtData) {

    //console.log(p_id, sinPtData, ptPredData);

    //region button events
    d3.select('#svg_history').remove();
    d3.selectAll(".code-tree").remove();
    d3.selectAll(".kg-network").remove();

    $('#contri-btn').unbind('click').click(function () {
    });
    $("#contri-btn").click(function () {
        $('#svg_history').remove();
        d3.selectAll(".code-tree").remove();
        d3.selectAll(".kg-network").remove();
        render_history_comp(p_id, sinPtData, ptPredData, oldPredData, oldSinPtData);
    });

    $('#detail-btn').unbind('click').click(function () {
    });
    $("#detail-btn").click(function () {
        $('#svg_history').remove();
        d3.selectAll(".code-tree").remove();
        d3.selectAll(".kg-network").remove();
        renderTemporalComp(p_id, sinPtData, ptPredData, oldPredData, oldSinPtData);
    });

    $('#reset-btn').unbind('click').click(function () {
    });
    $("#reset-btn").click(function () {
        resetHistory();
    });

    $('#remove-btn').unbind('click').click(function () {
    });
    $("#remove-btn").click(function () {
        updateCode(sinPtData, ptPredData, 0); //remove code
    });

    $('#add-btn').unbind('click').click(function () {
    });
    $("#add-btn").click(function () {
        updateCode(sinPtData, ptPredData, 0); //remove code
    });


    //endregion

    // region params and data transformation

    var width = 1100,
        height = 230,
        margin = 20;

    // x axis scale: each tick represent a visit, uniform distributed.

    var xDomain = Array.from(Array(Object.keys(sinPtData.admission).length).keys());
    xDomain.push(xDomain.length);
    xDomain.unshift(-1);

    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(xDomain), d3.max(xDomain)])
        .range([margin, width - margin]);

    var xRange = xDomain.map(x => xLinearScale(x));

    var xOrdinalScale = d3.scaleOrdinal()
        .domain(xDomain)
        .range(xRange);

    var xOldDomain = Array.from(Array(Object.keys(oldSinPtData.admission).length).keys());
    xOldDomain.push(xOldDomain.length);
    xOldDomain.unshift(-1);

    var xOldLinearScale = d3.scaleLinear()
        .domain([d3.min(xOldDomain), d3.max(xOldDomain)])
        .range([margin, width - margin]);

    var xOldRange = xOldDomain.map(x => xOldLinearScale(x));

    var xOldOrdinalScale = d3.scaleOrdinal()
        .domain(xOldDomain)
        .range(xOldRange);

    // y axis scale: for risk predict line chart
    var pred_res_time = Object.values(ptPredData[1][p_id]).map(x => +x);
    var pred_res_time_old = Object.values(oldPredData[1][p_id]).map(x => +x);
    var pred_res_time_max = d3.max([d3.max(pred_res_time), d3.max(pred_res_time_old)]);
    var pred_res_time_min = d3.min([d3.min(pred_res_time), d3.min(pred_res_time_old)]);

    var yLineScale = d3.scaleLinear()
        .domain([pred_res_time_min - 0.1 * pred_res_time_min, pred_res_time_max + 0.1 * pred_res_time_max])
        .range([80, 0]);

    var zoom = d3.zoom()
        .scaleExtent([0.1, 200])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    // endregion

    var svg = d3.select('#model-box').append("svg")
        .attr("id", function (d, i) {
            return "svg_history";
        })
        .attr("class", "svg")
        .attr("width", width + 20)
        .attr("height", height)
        .on("click", () => {
            d3.selectAll(".code-tree").remove();
            d3.selectAll(".kg-network").remove();
        })
        .call(zoom)
        .append("g")
        .attr("transform",
            "translate(" + 20 + "," + 0 + ")");

    //region contribution box

    var visit_cont = Object.values(ptPredData[3][p_id]).map(x => +x);
    var visit_cont_max = d3.max(visit_cont) + d3.max(visit_cont) * 0.5;
    var visit_cont_min = d3.min(visit_cont) - d3.min(visit_cont) * 0.5;

    var colorScalePos = d3.scaleSequential(d3.interpolateReds)
        .domain([0, visit_cont_max]);
    var colorScaleNeg = d3.scaleSequential(d3.interpolateBlues)
        .domain([visit_cont_min, 0]);

    var visit_box_height = 20;
    let num_visit = sinPtData.sort_keys.length;
    var visit_box_width = 1000 / 60;
    var visit_box_y = 180;

    var visit_cont_box = svg.selectAll('contri_rect')
        .data(sinPtData.sort_keys)
        .enter()
        .append('rect')
        .attr('class', 'cont_box')
        .attr('id', function (d, i) {
            return "visit_box" + d;
        })
        .attr('x', function (d, i) {
            return xOrdinalScale(i) - visit_box_width / 2 + 10;
        })
        .attr('y', function (d, i) {
            return visit_box_y;
        })
        .style("fill", function (d, i) {
            let visit_val = ptPredData[3][p_id][d];
            if (visit_val >= 0)
                return colorScalePos(visit_val);
            else
                return colorScaleNeg(visit_val);
        })
        .attr("stroke", "black")
        .style("stroke-width", 1)
        .attr('cursor', 'pointer')
        .on('click', function (e) {
            d3.event.stopPropagation();
            let visit_id = d3.select(this).attr('id').slice(9);
            let codeData = stratifyData(ptPredData[0][p_id][visit_id], p_id);
            let code_length = codeData.children.length;
            let code_div_height = (code_length + 5) * 12 + 50;
            let code_div_width = 270;
            let pos_left = this.getBoundingClientRect().x + 18;
            let select_text = '';
            for (let i = 0; i < drug_list.length; i++) {
                select_text = select_text + "<option value=" +
                    drug_list[i] + ">" + drug_list[i] + "</option>";
            }
            d3.select('#code-tree' + visit_id).remove();
            let html_text = `
                <div class = 'code-tree-title'>
                    code&nbsp;&nbsp;&nbsp;&nbsp;cont&nbsp;&nbsp;&nbsp;&nbsp;kg cont
                </div>
                <div id = 'code-tree-vis${visit_id}' style="width:${code_div_width}px; 
                height: ${code_div_height - 65}px" >
                
                </div>
                <div id="add-code-panel">
                    <br>
                    &nbsp;&nbsp;&nbsp;select a drug:
                    <select id="code-select" class="code-selection">
                        ${select_text}
                    </select>
                    <button type="button" class="viewswitch-btn" id="add-code-btn">Add</button>
                </div>
            `;
            var div = d3.select(".main-box").append("div")
                .attr('pointer-events', 'none')
                .attr('id', 'code-tree' + visit_id)
                .attr("class", "code-tree")
                .style("opacity", 1)
                .html(html_text)
                .style("width", code_div_width + 'px')
                .style("height", code_div_height + 'px')
                .style("left", pos_left + 'px')
                .style("top", (parseFloat(d3.select(this).attr('y')) +
                    parseFloat(460) -
                    parseFloat(code_div_height / 2) - 7.5) + 'px');
            $('#add-code-btn').unbind('click').click(function () {
            });
            $("#add-code-btn").click(function () {
                let e = document.getElementById('code-select');
                let code_name = e.options[e.selectedIndex].value;
                selectedCode[visit_id + '-' + code_name] = 2;
                updateCodeList();
            });
            renderCodeTree(codeData, code_div_height - 15, code_div_width, visit_id);

        })
        .attr("height", visit_box_height)
        .attr("width", visit_box_width - 2)
        .attr("transform", "translate(0,0)");

    // endregion

    // region draw code and knowledgraph
    // params
    var code_icon_size = 10;
    var code_cont = [];
    var code_kg_cont = [];
    Object.keys(ptPredData[0][p_id]).forEach((visit) => {
        Object.keys(ptPredData[0][p_id][visit]).forEach((code) => {
            code_cont.push(+ptPredData[0][p_id][visit][code][0]);
            code_kg_cont.push(+ptPredData[0][p_id][visit][code][1]);
        });
    });
    code_cont_max = d3.max(code_cont) + 0.3 * d3.max(code_cont);
    code_cont_min = d3.min(code_cont) - 0.3 * d3.min(code_cont);

    //use two color scale
    var codeScale = d3.scaleLinear()
        .domain([code_cont_min, code_cont_max])
        .range([165, 110]);

    console.log(code_kg_cont);

    var kgColorScalePos = d3.scaleSequential(d3.interpolateReds)
        .domain([0, d3.max(code_kg_cont) + 0.5 * d3.max(code_kg_cont)]);
    var kgColorScaleNeg = d3.scaleSequential(d3.interpolateReds)
        .domain([d3.min(code_kg_cont) - 0.5 * d3.min(code_kg_cont), 0]);

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("SVG:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", 65)
        .attr("x", 0)
        .attr("y", 110);

    // Create the scatter variable: where both the circles and the brush take place
    var scatter = svg.append('g')
        .attr("clip-path", "url(#clip)")

    scatter.selectAll('g')
        .data(sinPtData.sort_keys)
        .enter()
        .append("g")
        .selectAll('code_circle')
        .data(function (d, i) {
            var codes = d3.keys(ptPredData[0][p_id][d]);
            var codeObj = arrToObject(codes, d, i);
            return codeObj;
        })
        .enter()
        .append('circle')
        .attr('class', 'codebox')
        .attr('id', function (d, i, j) {
            return "id_code_posi" + d.code;
        })
        .attr('cx', function (d, i) {
            return xOrdinalScale(d.visit_index) + 10;
        })
        .attr('cy', function (d, i) {
            var code_val = ptPredData[0][p_id][d.visit][d.code][0];
            //console.log(d.visit_index, i, code_val);
            //let cy_pos = 175 - 4 * i;
            return codeScale(code_val);
            //return cy_pos;
        })
        .style("fill", function (d, i) {
            let code_val = ptPredData[0][p_id][d.visit][d.code][0];
            let kg_val = ptPredData[0][p_id][d.visit][d.code][1];
            //console.log(kg_val);
            if (kg_val > 0) {
                return kgColorScalePos(kg_val);
            } else if (kg_val > 0) {
                return kgColorScaleNeg(kg_val);
            } else if (kg_val == 0) {
                return '#fff';
            }
        })
        .style("cursor", "pointer")
        .on("click", function (d, i) {
            if (ifSelMode) {
                let code_id = d.code;
                let visit_id = d.visit;
                if (selectedCode[visit_id + '-' + code_id]) {
                    selectedCode[visit_id + '-' + code_id] = 0;
                    d3.select(this).attr("stroke", '#e67e22');
                    d3.select(this).style("stroke-width", 1.5);
                    updateCodeList();
                } else {
                    selectedCode[visit_id + '-' + code_id] = 1;
                    d3.select(this).attr("stroke", 'black');
                    d3.select(this).style("stroke-width", 0.5);
                    updateCodeList();
                }
            } else {
                d3.event.stopPropagation();
                d3.select(this).attr("r", 7);
                let code_id = d.code;
                let visit_id = d.visit;
                let code_val = parseFloat(ptPredData[0][p_id][d.visit][d.code][0]).toFixed(3);
                let kg_val = parseFloat(ptPredData[0][p_id][d.visit][d.code][1]).toFixed(3);
                let kg_data = ptPredData[2][p_id][d.visit][d.code];   //knowledge graph data, to be finished
                let kg_div_height = 350;
                let kg_div_width = 320;
                let pos_left = this.getBoundingClientRect().x + 10;
                let pos_top = this.getBoundingClientRect().y - 110;
                d3.select('#kg-network' + visit_id + code_id).remove();
                let title_id = 'kg-network' + visit_id + code_id + '-title';
                var div = d3.select(".main-box").append("div")
                    .attr('pointer-events', 'none')
                    .attr('id', 'kg-network' + visit_id + code_id)
                    .attr("class", "kg-network")
                    .html("<div class='kg-network-title' id=" + title_id + ">Knowledge Graph</div>" +
                        "<p class='kg-net-text'>code: " + code_id + "" +
                        "<br>cont: " + code_val +
                        "<br>kg cont: " + kg_val + "</p>")
                    .style("width", kg_div_width + 'px')
                    .style("height", kg_div_height + 'px')
                    .style("left", pos_left + 'px')
                    .style("top", pos_top + 'px');
                renderKGNetwork(kg_data, 320, 300, code_id, visit_id);
                dragElement(document.getElementById('kg-network' + visit_id + code_id));
            }
        })
        .on("mouseout", function () {
            d3.select(this).attr("r", 3);
        })
        .attr("stroke", "black")
        .style("stroke-width", 0.5)
        .attr("r", 3)
        .attr("transform", "translate(0,0)");

    //endregion

    // region render line chart

    var visit_line = svg.append("path")
        .datum(sinPtData.sort_keys)
        .attr("fill", "none")
        .attr("stroke", "#e74c3c")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .curve(d3.curveMonotoneX)
            .x(function (d, i) {
                return xOrdinalScale(i) + 10;
            })
            .y(function (d, i) {
                var pred_rist = ptPredData[1][p_id][d];
                if (pred_rist.substring(0, 1) == '[')
                    pred_rist = pred_rist.replace('[', '').replace(']', '');
                return yLineScale(pred_rist) + 20;
            })
        );

    var old_visit_line = svg.append("path")
        .datum(oldSinPtData.sort_keys)
        .attr("fill", "none")
        .attr("stroke", "#bdc3c7")
        .style("stroke-dasharray", ("3, 3"))
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .curve(d3.curveMonotoneX)
            .x(function (d, i) {
                return xOldOrdinalScale(i) + 10;
            })
            .y(function (d, i) {
                var pred_rist = oldPredData[1][p_id][d];
                if (pred_rist.substring(0, 1) == '[')
                    pred_rist = pred_rist.replace('[', '').replace(']', '');
                return yLineScale(pred_rist) + 20;
            })
        );

    var visit_line_points = svg.append("g")
        .selectAll("dot")
        .data(sinPtData.sort_keys)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) {
            return xOrdinalScale(i) + 10;
        })
        .attr("cy", function (d) {
            var pred_rist = ptPredData[1][p_id][d];
            if (pred_rist.substring(0, 1) == '[')
                pred_rist = pred_rist.replace('[', '').replace(']', '');
            return yLineScale(pred_rist) + 20;
        })
        .attr("r", 5)
        .attr("fill", "#e74c3c");

    var old_visit_line_points = svg.append("g")
        .selectAll("dot")
        .data(oldSinPtData.sort_keys)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) {
            return xOldOrdinalScale(i) + 10;
        })
        .attr("cy", function (d) {
            var pred_rist = oldPredData[1][p_id][d];
            if (pred_rist.substring(0, 1) == '[')
                pred_rist = pred_rist.replace('[', '').replace(']', '');
            return yLineScale(pred_rist) + 20;
        })
        .attr("r", 5)
        .attr("opacity", 0.5)
        .attr("fill", "#bdc3c7");
    // endregion

    // region draw code box axis
    // Add scales to axis
    var x_axis = d3.axisBottom()
        .tickFormat(function (d, i) {
            if (i != 0 & i != xRange.length - 1) {
                var a_id = sinPtData.sort_keys[i - 1];
                //return selectedsinPtData.date[a_id].toShortFormat();
                return "v" + i;
            } else
                return 1;
        })
        .scale(xOrdinalScale);

    //Append group and insert axis
    svg.append("g")
        .attr("transform", "translate(10," + (height - 20) + ")")
        .call(x_axis)
        .selectAll("text")
        .attr("x", 0)
        .attr("y", 10)
        // .attr("dy", 20)
        .attr("transform", "rotate(0)");

    var ticks = d3.selectAll(".tick");
    ticks.each(function (_, i) {
        if (i == 0) d3.select(this).remove();
        if (i == xRange.length - 1) d3.select(this).remove();
    });

    var y_axis = d3.axisLeft()
        .scale(codeScale)
        .ticks(5);

    svg.append("g")
        .attr("class", "code_axis")
        .attr("transform", "translate(30, 0)")
        .call(y_axis);
    //endregion

    // region line chart axis
    var x_line_axis = d3.axisBottom()
        .tickFormat("")
        .scale(xOrdinalScale);

    //Append group and insert axis
    //https://stackoverflow.com/questions/19787925/create-a-d3-axis-without-tick-labels
    svg.append("g")
        .attr("transform", "translate(10," + (height - 130) + ")")
        .call(x_line_axis)
        .selectAll("text")
        .attr("x", 0)
        .attr("y", 0)
        // .attr("dy", 20)
        .attr("transform", "rotate(0)");


    var y_line_axis = d3.axisLeft()
        .scale(yLineScale)
        .ticks(5);

    svg.append("g")
        .attr("class", "y_line_axis")
        .attr("transform", "translate(30, 20)")
        .call(y_line_axis);


    // endregion

    //region zoom event
    function zoomed() {
        var newCodeScale = d3.event.transform.rescaleY(codeScale);
        svg.select(".code_axis").call(y_axis.scale(newCodeScale));
        svg.selectAll('.codebox')
            .attr('cy', function (d, i) {
                var code_val = ptPredData[0][p_id][d.visit][d.code][0];
                return newCodeScale(code_val);
            });

    }

    //endregion


}


/**
 * render history by temporal
 * @param p_id: patient id
 */
function renderTemporal(p_id, sinPtData, ptPredData) {

    //console.log(p_id, sinPtData, ptPredData);

    //region button events
    cleanVis();

    $('#contri-btn').unbind('click').click(function () {
    });
    $("#contri-btn").click(function () {
        cleanVis();
        render_history(p_id, sinPtData, ptPredData);
    });

    $('#detail-btn').unbind('click').click(function () {
    });
    $("#detail-btn").click(function () {
        cleanVis();
        renderTemporal(p_id, sinPtData, ptPredData);
    });

    $('#reset-btn').unbind('click').click(function () {
    });
    $("#reset-btn").click(function () {
        resetHistory();
    });

    $('#remove-btn').unbind('click').click(function () {
    });
    $("#remove-btn").click(function () {
        updateCode(sinPtData, ptPredData, 1); //remove code
    });

    $('#add-btn').unbind('click').click(function () {
    });
    $("#add-btn").click(function () {
        updateCode(sinPtData, ptPredData, 1); //remove code
    });


    //endregion

    // region params and data transformation

    var width = 1100,
        height = 230,
        margin = 20;

    // x axis scale: each tick represent a visit, uniform distributed.

    var xDomain = Array.from(Array(Object.keys(sinPtData.admission).length).keys());
    xDomain.push(xDomain.length);
    xDomain.unshift(-1);

    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(xDomain), d3.max(xDomain)])
        .range([margin, width - margin]);

    var xRange = xDomain.map(x => xLinearScale(x));

    var xOrdinalScale = d3.scaleOrdinal()
        .domain(xDomain)
        .range(xRange);

    var minDate = clone(sinPtData.date[sinPtData.sort_keys[0]]);
    var maxDate = clone(sinPtData.date[sinPtData.sort_keys[sinPtData.sort_keys.length - 1]]);
    minDate = minDate.setDate(minDate.getDate() - 5);
    maxDate = maxDate.setDate(maxDate.getDate() + 5);

    var xTimeScale = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([margin, width - margin]);

    // y axis scale: for risk predict line chart
    var pred_res_time = Object.values(ptPredData[1][p_id]).map(x => +x);
    var pred_res_time_max = d3.max(pred_res_time) + d3.max(pred_res_time) * 0.1;
    var pred_res_time_min = d3.min(pred_res_time) - d3.min(pred_res_time) * 0.1;

    var yLineScale = d3.scaleLinear()
        .domain([pred_res_time_min, pred_res_time_max])
        .range([80, 0]);

    var zoom = d3.zoom()
        .scaleExtent([0.1, 200])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    // endregion

    var svg = d3.select('#model-box').append("svg")
        .attr("id", function (d, i) {
            return "svg_history";
        })
        .attr("class", "svg")
        .attr("width", width + 20)
        .attr("height", height)
        .on("click", () => {
            d3.selectAll(".code-tree").remove();
            d3.selectAll(".kg-network").remove();
        })
        .call(zoom)
        .append("g")
        .attr("transform",
            "translate(" + 20 + "," + 0 + ")");

    //region contribution box

    var visit_cont = Object.values(ptPredData[3][p_id]).map(x => +x);
    var visit_cont_max = d3.max(visit_cont) + d3.max(visit_cont) * 0.5;
    var visit_cont_min = d3.min(visit_cont) - d3.min(visit_cont) * 0.5;

    var colorScalePos = d3.scaleSequential(d3.interpolateReds)
        .domain([0, visit_cont_max]);
    var colorScaleNeg = d3.scaleSequential(d3.interpolateBlues)
        .domain([visit_cont_min, 0]);

    var visit_box_height = 20;
    let num_visit = sinPtData.sort_keys.length;
    var visit_box_width = 1000 / 60;
    var visit_box_y = 180;

    var visit_cont_box = svg.selectAll('contri_rect')
        .data(sinPtData.sort_keys)
        .enter()
        .append('rect')
        .attr('class', 'cont_box')
        .attr('id', function (d, i) {
            return "visit_box" + d;
        })
        .attr('x', function (d, i) {
            let date = sinPtData.date[d];
            return xTimeScale(date) - visit_box_width / 2 + 10;
        })
        .attr('y', function (d, i) {
            return visit_box_y;
        })
        .style("fill", function (d, i) {
            let visit_val = ptPredData[3][p_id][d];
            if (visit_val >= 0)
                return colorScalePos(visit_val);
            else
                return colorScaleNeg(visit_val);
        })
        .attr("stroke", "black")
        .style("stroke-width", 1)
        .attr('cursor', 'pointer')
        .on('click', function (e) {
            d3.event.stopPropagation();
            let visit_id = d3.select(this).attr('id').slice(9);
            let codeData = stratifyData(ptPredData[0][p_id][visit_id], p_id);
            let code_length = codeData.children.length;
            let code_div_height = (code_length + 5) * 12 + 50;
            let code_div_width = 270;
            let pos_left = this.getBoundingClientRect().x + 18;
            let select_text = '';
            for (let i = 0; i < drug_list.length; i++) {
                select_text = select_text + "<option value=" +
                    drug_list[i] + ">" + drug_list[i] + "</option>";
            }
            d3.select('#code-tree' + visit_id).remove();
            let html_text = `
                <div class = 'code-tree-title'>
                    code&nbsp;&nbsp;&nbsp;&nbsp;cont&nbsp;&nbsp;&nbsp;&nbsp;kg cont
                </div>
                <div id = 'code-tree-vis${visit_id}' style="width:${code_div_width}px; 
                height: ${code_div_height - 65}px" >
                
                </div>
                <div id="add-code-panel">
                    <br>
                    &nbsp;&nbsp;&nbsp;select a drug:
                    <select id="code-select" class="code-selection">
                        ${select_text}
                    </select>
                    <button type="button" class="viewswitch-btn" id="add-code-btn">Add</button>
                </div>
            `;
            var div = d3.select(".main-box").append("div")
                .attr('pointer-events', 'none')
                .attr('id', 'code-tree' + visit_id)
                .attr("class", "code-tree")
                .style("opacity", 1)
                .html(html_text)
                .style("width", code_div_width + 'px')
                .style("height", code_div_height + 'px')
                .style("left", pos_left + 'px')
                .style("top", (parseFloat(d3.select(this).attr('y')) +
                    parseFloat(460) -
                    parseFloat(code_div_height / 2) - 7.5) + 'px');

            $('#add-code-btn').unbind('click').click(function () {
            });
            $("#add-code-btn").click(function () {
                let e = document.getElementById('code-select');
                let code_name = e.options[e.selectedIndex].value;
                selectedCode[visit_id + '-' + code_name] = 2;
                updateCodeList();
            });
            renderCodeTree(codeData, code_div_height - 65, code_div_width, visit_id);

        })
        .attr("height", visit_box_height)
        .attr("width", visit_box_width - 2)
        .attr("transform", "translate(0,0)");

    // endregion

    // region draw code and knowledgraph
    // params
    var code_icon_size = 10;
    var code_cont = [];
    var code_kg_cont = [];
    Object.keys(ptPredData[0][p_id]).forEach((visit) => {
        Object.keys(ptPredData[0][p_id][visit]).forEach((code) => {
            code_cont.push(+ptPredData[0][p_id][visit][code][0]);
            code_kg_cont.push(+ptPredData[0][p_id][visit][code][1]);
        });
    });
    code_cont_max = d3.max(code_cont) + 0.3 * d3.max(code_cont);
    code_cont_min = d3.min(code_cont) - 0.3 * d3.min(code_cont);

    //use two color scale
    var codeScale = d3.scaleLinear()
        .domain([code_cont_min, code_cont_max])
        .range([165, 110]);

    var kgColorScalePos = d3.scaleSequential(d3.interpolateReds)
        .domain([0, d3.max(code_kg_cont) + 0.5 * d3.max(code_kg_cont)]);
    var kgColorScaleNeg = d3.scaleSequential(d3.interpolateReds)
        .domain([d3.min(code_kg_cont) - 0.5 * d3.min(code_kg_cont), 0]);

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("SVG:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", 65)
        .attr("x", 0)
        .attr("y", 110);

    // Create the scatter variable: where both the circles and the brush take place
    var scatter = svg.append('g')
        .attr("clip-path", "url(#clip)")

    scatter.selectAll('g')
        .data(sinPtData.sort_keys)
        .enter()
        .append("g")
        .selectAll('code_circle')
        .data(function (d, i) {
            var codes = d3.keys(ptPredData[0][p_id][d]);
            var codeObj = arrToObject(codes, d, i);
            return codeObj;
        })
        .enter()
        .append('circle')
        .attr('class', 'codebox')
        .attr('id', function (d, i, j) {
            return "id_code_posi" + d.code;
        })
        .attr('cx', function (d, i) {
            var date = sinPtData.date[d.visit];
            return xTimeScale(date) + 10;
        })
        .attr('cy', function (d, i) {
            var code_val = ptPredData[0][p_id][d.visit][d.code][0];
            //console.log(d.visit_index, i, code_val);
            //let cy_pos = 175 - 4 * i;
            return codeScale(code_val);
            //return cy_pos;
        })
        .style("fill", function (d, i) {
            let code_val = ptPredData[0][p_id][d.visit][d.code][0];
            let kg_val = ptPredData[0][p_id][d.visit][d.code][1];
            //console.log(kg_val);
            if (kg_val >= 0) {
                return kgColorScalePos(kg_val);
            } else {
                return kgColorScaleNeg(kg_val);
            }
        })
        .style("cursor", "pointer")
        .on("click", function (d, i) {
            if (ifSelMode) {
                let code_id = d.code;
                let visit_id = d.visit;
                if (selectedCode[visit_id + '-' + code_id]) {
                    selectedCode[visit_id + '-' + code_id] = 0;
                    d3.select(this).attr("stroke", '#e67e22');
                    d3.select(this).style("stroke-width", 1.5);
                    updateCodeList();
                } else {
                    selectedCode[visit_id + '-' + code_id] = 1;
                    d3.select(this).attr("stroke", 'black');
                    d3.select(this).style("stroke-width", 0.5);
                    updateCodeList();
                }
            } else {
                d3.event.stopPropagation();
                d3.select(this).attr("r", 7);
                let code_id = d.code;
                let visit_id = d.visit;
                let code_val = parseFloat(ptPredData[0][p_id][d.visit][d.code][0]).toFixed(3);
                let kg_val = parseFloat(ptPredData[0][p_id][d.visit][d.code][1]).toFixed(3);
                let kg_data = ptPredData[2][p_id][d.visit][d.code];   //knowledge graph data, to be finished
                let kg_div_height = 350;
                let kg_div_width = 320;
                let pos_left = this.getBoundingClientRect().x + 10;
                let pos_top = this.getBoundingClientRect().y - 110;
                d3.select('#kg-network' + visit_id + code_id).remove();
                let title_id = 'kg-network' + visit_id + code_id + '-title';
                var div = d3.select(".main-box").append("div")
                    .attr('pointer-events', 'none')
                    .attr('id', 'kg-network' + visit_id + code_id)
                    .attr("class", "kg-network")
                    .html("<div class='kg-network-title' id=" + title_id + ">Knowledge Graph</div>" +
                        "<p class='kg-net-text'>code: " + code_id + "" +
                        "<br>cont: " + code_val +
                        "<br>kg cont: " + kg_val + "</p>")
                    .style("width", kg_div_width + 'px')
                    .style("height", kg_div_height + 'px')
                    .style("left", pos_left + 'px')
                    .style("top", pos_top + 'px');
                renderKGNetwork(kg_data, 320, 300, code_id, visit_id);
                dragElement(document.getElementById('kg-network' + visit_id + code_id));
            }
        })
        .on("mouseout", function () {
            d3.select(this).attr("r", 3);
        })
        .attr("stroke", "black")
        .style("stroke-width", 0.5)
        .attr("r", 3)
        .attr("transform", "translate(0,0)");

    //endregion

    // region render line chart

    var visit_line = svg.append("path")
        .datum(sinPtData.sort_keys)
        .attr("fill", "none")
        .attr("stroke", "#666666")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .curve(d3.curveMonotoneX)
            .x(function (d, i) {
                return xTimeScale(sinPtData.date[d]) + 10;
            })
            .y(function (d, i) {
                var pred_rist = ptPredData[1][p_id][d];
                if (pred_rist.substring(0, 1) == '[')
                    pred_rist = pred_rist.replace('[', '').replace(']', '');
                return yLineScale(pred_rist) + 20;
            })
        );

    var visit_line_points = svg.append("g")
        .selectAll("dot")
        .data(sinPtData.sort_keys)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) {
            return xTimeScale(sinPtData.date[d]) + 10;
        })
        .attr("cy", function (d) {
            var pred_rist = ptPredData[1][p_id][d];
            if (pred_rist.substring(0, 1) == '[')
                pred_rist = pred_rist.replace('[', '').replace(']', '');
            return yLineScale(pred_rist) + 20;
        })
        .attr("r", 5)
        .attr("fill", "#666666");
    // endregion

    // region draw code box axis
    // Add scales to axis
    var x_time_axis = d3.axisBottom()
        .tickFormat(d3.timeFormat("%Y-%m-%d"))
        .scale(xTimeScale);

    //Append group and insert axis
    svg.append("g")
        .attr("class", "axis code-time-axis")
        .attr("transform", "translate(10," + (height - 20) + ")")
        .call(x_time_axis)
        .selectAll("text")
        .attr("x", 0)
        .attr("y", 10)
        // .attr("dy", 20)
        .attr("transform", "rotate(0)");


    var y_axis = d3.axisLeft()
        .scale(codeScale)
        .ticks(5);

    svg.append("g")
        .attr("class", "code_axis")
        .attr("transform", "translate(30, 0)")
        .call(y_axis);
    //endregion

    // region line chart axis
    var x_line_axis = d3.axisBottom()
        .tickFormat("")
        .scale(xTimeScale);

    //Append group and insert axis
    //https://stackoverflow.com/questions/19787925/create-a-d3-axis-without-tick-labels
    svg.append("g")
        .attr("class", "axis line-axis")
        .attr("transform", "translate(10," + (height - 130) + ")")
        .call(x_line_axis)
        .selectAll("text")
        .attr("x", 0)
        .attr("y", 0)
        // .attr("dy", 20)
        .attr("transform", "rotate(0)");


    var y_line_axis = d3.axisLeft()
        .scale(yLineScale)
        .ticks(5);

    svg.append("g")
        .attr("class", "y_line_axis")
        .attr("transform", "translate(30, 20)")
        .call(y_line_axis);


    // endregion

    //region zoom event
    function zoomed() {
        if (ifTempMode) {
            var newTimeScale = d3.event.transform.rescaleX(xTimeScale);
            svg.selectAll(".cont_box").attr('x', function (d, i) {
                let date = sinPtData.date[d];
                return newTimeScale(date) - visit_box_width / 2 + 10;
            });
            svg.selectAll('.codebox')
                .attr('cx', function (d, i) {
                    var date = sinPtData.date[d.visit];
                    return newTimeScale(date) + 10;
                });
            visit_line.attr("d", d3.line()
                .curve(d3.curveMonotoneX)
                .x(function (d, i) {
                    return newTimeScale(sinPtData.date[d]) + 10;
                })
                .y(function (d, i) {
                    var pred_rist = ptPredData[1][p_id][d];
                    if (pred_rist.substring(0, 1) == '[')
                        pred_rist = pred_rist.replace('[', '').replace(']', '');
                    return yLineScale(pred_rist) + 20;
                })
            );
            visit_line_points.attr("cx", function (d, i) {
                return newTimeScale(sinPtData.date[d]) + 10;
            });
            svg.select(".code-time-axis").call(x_time_axis.scale(newTimeScale));
            svg.select(".line-axis").call(x_line_axis.scale(newTimeScale));
        } else {
            var newCodeScale = d3.event.transform.rescaleY(codeScale);
            svg.select(".code_axis").call(y_axis.scale(newCodeScale));
            svg.selectAll('.codebox')
                .attr('cy', function (d, i) {
                    var code_val = ptPredData[0][p_id][d.visit][d.code][0];
                    return newCodeScale(code_val);
                });
        }


    }

    //endregion


}

/**
 * render history by temporal
 * @param p_id: patient id
 */
function renderTemporalComp(p_id, sinPtData, ptPredData, oldPredData, oldSinPtData) {

    //console.log(p_id, sinPtData, ptPredData);

    //region button events
    cleanVis();

    $('#contri-btn').unbind('click').click(function () {
    });
    $("#contri-btn").click(function () {
        cleanVis();
        render_history_comp(p_id, sinPtData, ptPredData, oldPredData, oldSinPtData);
    });

    $('#detail-btn').unbind('click').click(function () {
    });
    $("#detail-btn").click(function () {
        cleanVis();
        renderTemporalComp(p_id, sinPtData, ptPredData, oldPredData, oldSinPtData);
    });

    $('#reset-btn').unbind('click').click(function () {
    });
    $("#reset-btn").click(function () {
        resetHistory();
    });

    $('#remove-btn').unbind('click').click(function () {
    });
    $("#remove-btn").click(function () {
        updateCode(sinPtData, ptPredData, 1); //remove code
    });

    $('#add-btn').unbind('click').click(function () {
    });
    $("#add-btn").click(function () {
        updateCode(sinPtData, ptPredData, 1); //remove code
    });


    //endregion

    // region params and data transformation

    var width = 1100,
        height = 230,
        margin = 20;

    // x axis scale: each tick represent a visit, uniform distributed.

    var xDomain = Array.from(Array(Object.keys(sinPtData.admission).length).keys());
    xDomain.push(xDomain.length);
    xDomain.unshift(-1);

    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(xDomain), d3.max(xDomain)])
        .range([margin, width - margin]);

    var xRange = xDomain.map(x => xLinearScale(x));

    var xOrdinalScale = d3.scaleOrdinal()
        .domain(xDomain)
        .range(xRange);

    var minDate = clone(sinPtData.date[sinPtData.sort_keys[0]]);
    var maxDate = clone(sinPtData.date[sinPtData.sort_keys[sinPtData.sort_keys.length - 1]]);
    minDate = minDate.setDate(minDate.getDate() - 5);
    maxDate = maxDate.setDate(maxDate.getDate() + 5);

    var xTimeScale = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([margin, width - margin]);

    var minDateOld = clone(oldSinPtData.date[oldSinPtData.sort_keys[0]]);
    var maxDateOld = clone(oldSinPtData.date[oldSinPtData.sort_keys[oldSinPtData.sort_keys.length - 1]]);
    minDateOld = minDateOld.setDate(minDateOld.getDate() - 5);
    maxDateOld = maxDateOld.setDate(maxDateOld.getDate() + 5);

    var xTimeScaleOld = d3.scaleTime()
        .domain([minDateOld, maxDateOld])
        .range([margin, width - margin]);

    // y axis scale: for risk predict line chart
    var pred_res_time = Object.values(ptPredData[1][p_id]).map(x => +x);
    var pred_res_time_old = Object.values(oldPredData[1][p_id]).map(x => +x);
    var pred_res_time_max = d3.max([d3.max(pred_res_time), d3.max(pred_res_time_old)]);
    var pred_res_time_min = d3.min([d3.min(pred_res_time), d3.min(pred_res_time_old)]);

    var yLineScale = d3.scaleLinear()
        .domain([pred_res_time_min - 0.1 * pred_res_time_min, pred_res_time_max + 0.1 * pred_res_time_max])
        .range([80, 0]);

    var zoom = d3.zoom()
        .scaleExtent([0.1, 200])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    // endregion

    var svg = d3.select('#model-box').append("svg")
        .attr("id", function (d, i) {
            return "svg_history";
        })
        .attr("class", "svg")
        .attr("width", width + 20)
        .attr("height", height)
        .on("click", () => {
            d3.selectAll(".code-tree").remove();
            d3.selectAll(".kg-network").remove();
        })
        .call(zoom)
        .append("g")
        .attr("transform",
            "translate(" + 20 + "," + 0 + ")");

    //region contribution box

    var visit_cont = Object.values(ptPredData[3][p_id]).map(x => +x);
    var visit_cont_max = d3.max(visit_cont) + d3.max(visit_cont) * 0.5;
    var visit_cont_min = d3.min(visit_cont) - d3.min(visit_cont) * 0.5;

    var colorScalePos = d3.scaleSequential(d3.interpolateReds)
        .domain([0, visit_cont_max]);
    var colorScaleNeg = d3.scaleSequential(d3.interpolateBlues)
        .domain([visit_cont_min, 0]);

    var visit_box_height = 20;
    let num_visit = sinPtData.sort_keys.length;
    var visit_box_width = 1000 / 60;
    var visit_box_y = 180;

    var visit_cont_box = svg.selectAll('contri_rect')
        .data(sinPtData.sort_keys)
        .enter()
        .append('rect')
        .attr('class', 'cont_box')
        .attr('id', function (d, i) {
            return "visit_box" + d;
        })
        .attr('x', function (d, i) {
            let date = sinPtData.date[d];
            return xTimeScale(date) - visit_box_width / 2 + 10;
        })
        .attr('y', function (d, i) {
            return visit_box_y;
        })
        .style("fill", function (d, i) {
            let visit_val = ptPredData[3][p_id][d];
            if (visit_val >= 0)
                return colorScalePos(visit_val);
            else
                return colorScaleNeg(visit_val);
        })
        .attr("stroke", "black")
        .style("stroke-width", 1)
        .attr('cursor', 'pointer')
        .on('click', function (e) {
            d3.event.stopPropagation();
            let visit_id = d3.select(this).attr('id').slice(9);
            let codeData = stratifyData(ptPredData[0][p_id][visit_id], p_id);
            let code_length = codeData.children.length;
            let code_div_height = (code_length + 5) * 12 + 50;
            let code_div_width = 270;
            let pos_left = this.getBoundingClientRect().x + 18;
            let select_text = '';
            for (let i = 0; i < drug_list.length; i++) {
                select_text = select_text + "<option value=" +
                    drug_list[i] + ">" + drug_list[i] + "</option>";
            }
            d3.select('#code-tree' + visit_id).remove();
            let html_text = `
                <div class = 'code-tree-title'>
                    code&nbsp;&nbsp;&nbsp;&nbsp;cont&nbsp;&nbsp;&nbsp;&nbsp;kg cont
                </div>
                <div id = 'code-tree-vis${visit_id}' style="width:${code_div_width}px; 
                height: ${code_div_height - 65}px" >
                
                </div>
                <div id="add-code-panel">
                    <br>
                    &nbsp;&nbsp;&nbsp;select a drug:
                    <select id="code-select" class="code-selection">
                        ${select_text}
                    </select>
                    <button type="button" class="viewswitch-btn" id="add-code-btn">Add</button>
                </div>
            `;
            var div = d3.select(".main-box").append("div")
                .attr('pointer-events', 'none')
                .attr('id', 'code-tree' + visit_id)
                .attr("class", "code-tree")
                .style("opacity", 1)
                .html(html_text)
                .style("width", code_div_width + 'px')
                .style("height", code_div_height + 'px')
                .style("left", pos_left + 'px')
                .style("top", (parseFloat(d3.select(this).attr('y')) +
                    parseFloat(460) -
                    parseFloat(code_div_height / 2) - 7.5) + 'px');

            $('#add-code-btn').unbind('click').click(function () {
            });
            $("#add-code-btn").click(function () {
                let e = document.getElementById('code-select');
                let code_name = e.options[e.selectedIndex].value;
                selectedCode[visit_id + '-' + code_name] = 2;
                updateCodeList();
            });
            renderCodeTree(codeData, code_div_height - 65, code_div_width, visit_id);

        })
        .attr("height", visit_box_height)
        .attr("width", visit_box_width - 2)
        .attr("transform", "translate(0,0)");

    // endregion

    // region draw code and knowledgraph
    // params
    var code_icon_size = 10;
    var code_cont = [];
    var code_kg_cont = [];
    Object.keys(ptPredData[0][p_id]).forEach((visit) => {
        Object.keys(ptPredData[0][p_id][visit]).forEach((code) => {
            code_cont.push(+ptPredData[0][p_id][visit][code][0]);
            code_kg_cont.push(+ptPredData[0][p_id][visit][code][1]);
        });
    });
    code_cont_max = d3.max(code_cont) + 0.3 * d3.max(code_cont);
    code_cont_min = d3.min(code_cont) - 0.3 * d3.min(code_cont);

    //use two color scale
    var codeScale = d3.scaleLinear()
        .domain([code_cont_min, code_cont_max])
        .range([165, 110]);

    var kgColorScalePos = d3.scaleSequential(d3.interpolateReds)
        .domain([0, d3.max(code_kg_cont) + 0.5 * d3.max(code_kg_cont)]);
    var kgColorScaleNeg = d3.scaleSequential(d3.interpolateReds)
        .domain([d3.min(code_kg_cont) - 0.5 * d3.min(code_kg_cont), 0]);


    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("SVG:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", 65)
        .attr("x", 0)
        .attr("y", 110);

    // Create the scatter variable: where both the circles and the brush take place
    var scatter = svg.append('g')
        .attr("clip-path", "url(#clip)")

    scatter.selectAll('g')
        .data(sinPtData.sort_keys)
        .enter()
        .append("g")
        .selectAll('code_circle')
        .data(function (d, i) {
            var codes = d3.keys(ptPredData[0][p_id][d]);
            var codeObj = arrToObject(codes, d, i);
            return codeObj;
        })
        .enter()
        .append('circle')
        .attr('class', 'codebox')
        .attr('id', function (d, i, j) {
            return "id_code_posi" + d.code;
        })
        .attr('cx', function (d, i) {
            var date = sinPtData.date[d.visit];
            return xTimeScale(date) + 10;
        })
        .attr('cy', function (d, i) {
            var code_val = ptPredData[0][p_id][d.visit][d.code][0];
            //console.log(d.visit_index, i, code_val);
            //let cy_pos = 175 - 4 * i;
            return codeScale(code_val);
            //return cy_pos;
        })
        .style("fill", function (d, i) {
            let code_val = ptPredData[0][p_id][d.visit][d.code][0];
            let kg_val = ptPredData[0][p_id][d.visit][d.code][1];
            //console.log(kg_val);
            if (kg_val >= 0) {
                return kgColorScalePos(kg_val);
            } else {
                return kgColorScaleNeg(kg_val);
            }
        })
        .style("cursor", "pointer")
        .on("click", function (d, i) {
            if (ifSelMode) {
                let code_id = d.code;
                let visit_id = d.visit;
                if (selectedCode[visit_id + '-' + code_id]) {
                    selectedCode[visit_id + '-' + code_id] = 0;
                    d3.select(this).attr("stroke", '#e67e22');
                    d3.select(this).style("stroke-width", 1.5);
                    updateCodeList();
                } else {
                    selectedCode[visit_id + '-' + code_id] = 1;
                    d3.select(this).attr("stroke", 'black');
                    d3.select(this).style("stroke-width", 0.5);
                    updateCodeList();
                }
            } else {
                d3.event.stopPropagation();
                d3.select(this).attr("r", 7);
                let code_id = d.code;
                let visit_id = d.visit;
                let code_val = parseFloat(ptPredData[0][p_id][d.visit][d.code][0]).toFixed(3);
                let kg_val = parseFloat(ptPredData[0][p_id][d.visit][d.code][1]).toFixed(3);
                let kg_data = ptPredData[2][p_id][d.visit][d.code];   //knowledge graph data, to be finished
                let kg_div_height = 350;
                let kg_div_width = 320;
                let pos_left = this.getBoundingClientRect().x + 10;
                let pos_top = this.getBoundingClientRect().y - 110;
                d3.select('#kg-network' + visit_id + code_id).remove();
                let title_id = 'kg-network' + visit_id + code_id + '-title';
                var div = d3.select(".main-box").append("div")
                    .attr('pointer-events', 'none')
                    .attr('id', 'kg-network' + visit_id + code_id)
                    .attr("class", "kg-network")
                    .html("<div class='kg-network-title' id=" + title_id + ">Knowledge Graph</div>" +
                        "<p class='kg-net-text'>code: " + code_id + "" +
                        "<br>cont: " + code_val +
                        "<br>kg cont: " + kg_val + "</p>")
                    .style("width", kg_div_width + 'px')
                    .style("height", kg_div_height + 'px')
                    .style("left", pos_left + 'px')
                    .style("top", pos_top + 'px');
                renderKGNetwork(kg_data, 320, 300, code_id, visit_id);
                dragElement(document.getElementById('kg-network' + visit_id + code_id));
            }
        })
        .on("mouseout", function () {
            d3.select(this).attr("r", 3);
        })
        .attr("stroke", "black")
        .style("stroke-width", 0.5)
        .attr("r", 3)
        .attr("transform", "translate(0,0)");

    //endregion

    // region render line chart

    var visit_line = svg.append("path")
        .datum(sinPtData.sort_keys)
        .attr("fill", "none")
        .attr("stroke", "#e74c3c")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .curve(d3.curveMonotoneX)
            .x(function (d, i) {
                return xTimeScale(sinPtData.date[d]) + 10;
            })
            .y(function (d, i) {
                var pred_rist = ptPredData[1][p_id][d];
                if (pred_rist.substring(0, 1) == '[')
                    pred_rist = pred_rist.replace('[', '').replace(']', '');
                return yLineScale(pred_rist) + 20;
            })
        );

    var old_visit_line = svg.append("path")
        .datum(oldSinPtData.sort_keys)
        .attr("fill", "none")
        .attr("stroke", "#bdc3c7")
        .style("stroke-dasharray", ("3, 3"))
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .curve(d3.curveMonotoneX)
            .x(function (d, i) {
                return xTimeScaleOld(i) + 10;
            })
            .y(function (d, i) {
                var pred_rist = oldPredData[1][p_id][d];
                if (pred_rist.substring(0, 1) == '[')
                    pred_rist = pred_rist.replace('[', '').replace(']', '');
                return yLineScale(pred_rist) + 20;
            })
        );

    var visit_line_points = svg.append("g")
        .selectAll("dot")
        .data(sinPtData.sort_keys)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) {
            return xTimeScale(sinPtData.date[d]) + 10;
        })
        .attr("cy", function (d) {
            var pred_rist = ptPredData[1][p_id][d];
            if (pred_rist.substring(0, 1) == '[')
                pred_rist = pred_rist.replace('[', '').replace(']', '');
            return yLineScale(pred_rist) + 20;
        })
        .attr("r", 5)
        .attr("fill", "#e74c3c");

    var old_visit_line_points = svg.append("g")
        .selectAll("dot")
        .data(oldSinPtData.sort_keys)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) {
            return xTimeScaleOld(oldSinPtData.date[d]) + 10;
        })
        .attr("cy", function (d) {
            var pred_rist = oldPredData[1][p_id][d];
            if (pred_rist.substring(0, 1) == '[')
                pred_rist = pred_rist.replace('[', '').replace(']', '');
            return yLineScale(pred_rist) + 20;
        })
        .attr("r", 5)
        .attr("opacity", 0.5)
        .attr("fill", "#bdc3c7");
    // endregion

    // region draw code box axis
    // Add scales to axis
    var x_time_axis = d3.axisBottom()
        .tickFormat(d3.timeFormat("%Y-%m-%d"))
        .scale(xTimeScale);

    //Append group and insert axis
    svg.append("g")
        .attr("class", "axis code-time-axis")
        .attr("transform", "translate(10," + (height - 20) + ")")
        .call(x_time_axis)
        .selectAll("text")
        .attr("x", 0)
        .attr("y", 10)
        // .attr("dy", 20)
        .attr("transform", "rotate(0)");


    var y_axis = d3.axisLeft()
        .scale(codeScale)
        .ticks(5);

    svg.append("g")
        .attr("class", "code_axis")
        .attr("transform", "translate(30, 0)")
        .call(y_axis);
    //endregion

    // region line chart axis
    var x_line_axis = d3.axisBottom()
        .tickFormat("")
        .scale(xTimeScale);

    //Append group and insert axis
    //https://stackoverflow.com/questions/19787925/create-a-d3-axis-without-tick-labels
    svg.append("g")
        .attr("class", "axis line-axis")
        .attr("transform", "translate(10," + (height - 130) + ")")
        .call(x_line_axis)
        .selectAll("text")
        .attr("x", 0)
        .attr("y", 0)
        // .attr("dy", 20)
        .attr("transform", "rotate(0)");


    var y_line_axis = d3.axisLeft()
        .scale(yLineScale)
        .ticks(5);

    svg.append("g")
        .attr("class", "y_line_axis")
        .attr("transform", "translate(30, 20)")
        .call(y_line_axis);


    // endregion

    //region zoom event
    function zoomed() {
        if (ifTempMode) {
            var newTimeScale = d3.event.transform.rescaleX(xTimeScale);
            var newTimeScaleOld = d3.event.transform.rescaleX(xTimeScaleOld);
            svg.selectAll(".cont_box").attr('x', function (d, i) {
                let date = sinPtData.date[d];
                return newTimeScale(date) - visit_box_width / 2 + 10;
            });
            svg.selectAll('.codebox')
                .attr('cx', function (d, i) {
                    var date = sinPtData.date[d.visit];
                    return newTimeScale(date) + 10;
                });
            visit_line.attr("d", d3.line()
                .curve(d3.curveMonotoneX)
                .x(function (d, i) {
                    return newTimeScale(sinPtData.date[d]) + 10;
                })
                .y(function (d, i) {
                    var pred_rist = ptPredData[1][p_id][d];
                    if (pred_rist.substring(0, 1) == '[')
                        pred_rist = pred_rist.replace('[', '').replace(']', '');
                    return yLineScale(pred_rist) + 20;
                })
            );
            old_visit_line.attr("d", d3.line()
                .curve(d3.curveMonotoneX)
                .x(function (d, i) {
                    return newTimeScaleOld(oldSinPtData.date[d]) + 10;
                })
                .y(function (d, i) {
                    var pred_rist = oldPredData[1][p_id][d];
                    if (pred_rist.substring(0, 1) == '[')
                        pred_rist = pred_rist.replace('[', '').replace(']', '');
                    return yLineScale(pred_rist) + 20;
                })
            );
            visit_line_points.attr("cx", function (d, i) {
                return newTimeScale(sinPtData.date[d]) + 10;
            });
            old_visit_line_points.attr("cx", function (d, i) {
                return newTimeScaleOld(oldSinPtData.date[d]) + 10;
            });
            svg.select(".code-time-axis").call(x_time_axis.scale(newTimeScale));
            svg.select(".line-axis").call(x_line_axis.scale(newTimeScale));
        } else {
            var newCodeScale = d3.event.transform.rescaleY(codeScale);
            svg.select(".code_axis").call(y_axis.scale(newCodeScale));
            svg.selectAll('.codebox')
                .attr('cy', function (d, i) {
                    var code_val = ptPredData[0][p_id][d.visit][d.code][0];
                    return newCodeScale(code_val);
                });
        }


    }


    //endregion


}

