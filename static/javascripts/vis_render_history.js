/**
 * @Description draw patient demographics info.
 * @Author: Rui Li
 * @Date: 9/25/19
 */



// global variables
var selectedCode = new Object();
var currentCode = new Object();
var ifSelMode = false;  //check keyboard event
var ifTempMode = false;
var drug_list = ["60320", "60314", "60157", "60394", "60392", "60111", "60110", "60362", "60361"];
var ifComp = false;

/**
 * get the infomation of select patient
 * @param p_id
 */
async function getSelectedPatientInfo(p_id) {
    var selectedPtData = findPatientData([p_id])[p_id];  //obtatin the selected patient data
    var pid_aid_did_dict = {[p_id]: ptTestData[0][p_id]};  //build the select patient dic as input to the model
    gPID = p_id;
    currentCode = dictToCode(pid_aid_did_dict);
    selectedCode = clone(currentCode);
    var PtPredData = await get_pred_data(pid_aid_did_dict);  //get the prediction information
    gPtPredData = PtPredData;
    gSinPtData = selectedPtData;
    $('#svg_history').remove();
    //render knowledge graph
    await highLightKG(p_id, selectedPtData, PtPredData);
    await renderPtHistory(p_id, selectedPtData, PtPredData, selectedPtData, PtPredData, 0, 0);

}

/**
 * what if analysis, update medical code, update the prediction results
 * @param sinPtData
 * @param ptPredData
 * @param isTemporal
 * @returns {Promise<void>}
 */
async function updateCode(sinPtData, ptPredData, isTemporal) {
    cleanVis();
    let pid_aid_did_dict = codeToDict(selectedCode);
    newSinPtData = updateSinPtData(sinPtData, pid_aid_did_dict);
    var newPredData = await get_pred_data(pid_aid_did_dict);  //get the prediction information
    //selectedCode = dictToCode(pid_aid_did_dict);  //update, keep all updates records if commented
    if (isTemporal == 1)
        renderPtHistory(gPID, newSinPtData, newPredData, sinPtData, ptPredData, 1, 1);
    else
        renderPtHistory(gPID, newSinPtData, newPredData, sinPtData, ptPredData, 1, 0);
}

/**
 * render the history of single patient
 * by Rui, 2020/01/11 rewrite
 * merge function together
 * @param p_id: patient id
 * @param sinPtData: current single patient data that include visit/code id, dates, sorted visit id
 * @param ptPredData: current single patient prediction results, 1. cont of code and knowledge graph. 2. pred among time
 * 3. knowledge graph 4. cont of each visit
 * @param oldSinPtData: old patient data
 * @param oldPredData: old patient prediction results
 * @param ifUpdate: if update the patient information
 * @param ifTemporal: if a temporal view
 */
function renderPtHistory(p_id, sinPtData, ptPredData, oldSinPtData, oldPredData, ifUpdate, ifTemporal) {

    //console.log(sinPtData, ptPredData);
    // console.log(ptPredData[1][p_id][testb]);

    //region button events
    cleanVis();

    //comparison between kg and nk
    $('#kg-comp').unbind('click').click(function () {
    });
    $("#kg-comp").click(function () {
        var checked = $(this).is(':checked');
        if (checked) {
            ifComp = true;
            //render the comparison
            renderCompare();
        } else {
            ifComp = false;
            //remove the comparison
            renderCompare();
        }
    });

    //switch to the visit-view
    $('#visit-view-btn').unbind('click').click(function () {
    });
    $("#visit-view-btn").click(function () {
        cleanVis();
        renderPtHistory(p_id, sinPtData, ptPredData, oldSinPtData, oldPredData, ifUpdate, 0);
    });

    //switch to the temporal view
    $('#temp-view-btn').unbind('click').click(function () {
    });
    $("#temp-view-btn").click(function () {
        cleanVis();
        renderPtHistory(p_id, sinPtData, ptPredData, oldSinPtData, oldPredData, ifUpdate, 1);
    });

    //reset the default status
    $('#reset-btn').unbind('click').click(function () {
    });
    $("#reset-btn").click(function () {
        resetHistory(ifTemporal);
    });

    //remove the medical code
    $('#remove-btn').unbind('click').click(function () {
    });
    $("#remove-btn").click(function () {
        updateCode(sinPtData, ptPredData, ifTemporal); //remove code
    });

    //add the drug
    $('#add-btn').unbind('click').click(function () {
    });
    $("#add-btn").click(function () {
        updateCode(sinPtData, ptPredData, ifTemporal); //remove code
    });

    //endregion

    //region params and data transformation
    var width = 1100,
        height = 230,
        margin = 20;

    // visit axis scale, the scale is based on the medical visit count
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

    //old visit data scale
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

    // temporal x axis scale, the scale is based on the date
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

    // the scale of y axis in the line chart, show the prediction results among the time
    // y axis scale: for risk predict line chart
    var pred_res_time = Object.values(ptPredData[1][p_id]).map(x => +x);
    var pred_res_time_old = Object.values(oldPredData[1][p_id]).map(x => +x);
    // the range of nk prediction results (if comparison is not used, comment these code)
    var pred_res_time_nk = Object.values(oldPredData[4][p_id]).map(x => +x);
    var pred_res_time_max = d3.max([d3.max(pred_res_time), d3.max(pred_res_time_old), d3.max(pred_res_time_nk)]);
    var pred_res_time_min = d3.min([d3.min(pred_res_time), d3.min(pred_res_time_old), d3.min(pred_res_time_nk)]);

    var yLineScale = d3.scaleLinear()
        .domain(extendRange([pred_res_time_min, pred_res_time_max], 0.2))
        .range([80, 0]);

    // params of zooming function
    var zoom = d3.zoom()
        .scaleExtent([0.1, 300])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    var svg = d3.select('#model-box').append("svg")
        .attr("id", function (d, i) {
            return "svg_history";
        })
        .attr("class", "svg")
        .attr("width", width + 20)
        .attr("height", height)
        .on("click", () => {
            ds = 0;
            d3.selectAll(".detail-kg").remove();
            d3.selectAll(".code-tree").remove();
            d3.selectAll(".kg-network").remove();
        })
        .call(zoom)
        .append("g")
        .attr("transform",
            "translate(" + 20 + "," + 0 + ")");

    //tips
    tip = d3.tip().attr('class', 'd3-tip').html(function (d) {
        let code_id = d.code;
        let code_val = parseFloat(ptPredData[0][p_id][d.visit][d.code][0]).toFixed(3);
        let code_name = ptTestData[2][code_id];
        if (code_val >= 0) {
            return "<span>" + code_name + ": </span> <span style='color:red'>" + code_val + "</span>";
        } else {
            return "<span>" + code_name + ": </span> <span style='color:#3498db'>" + code_val + "</span>";
        }

    });

    svg.call(tip);

    //endregion

    //region visit contribution box

    //find the range of visit contribution
    var visit_cont = Object.values(ptPredData[3][p_id]).map(x => +x);
    var visit_cont_range = extendRange(d3.extent(visit_cont), 0.5);
    // console.log(visit_cont_range);

    var colorScalePos = d3.scaleSequential(d3.interpolateReds)
        .domain([0, visit_cont_range[1]]);
    var colorScaleNeg = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, Math.abs(visit_cont_range[0])]);

    var visit_box_height = 20;
    let num_visit = sinPtData.sort_keys.length;
    var visit_box_width = 20;
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
            if (ifTemporal == 0) {
                return xOrdinalScale(i) - visit_box_width / 2 + 10;
            } else {
                let date = sinPtData.date[d];
                return xTimeScale(date) - visit_box_width / 2 + 10;
            }
        })
        .attr('y', function (d, i) {
            return visit_box_y;
        })
        .style("fill", function (d, i) {
            let visit_val = ptPredData[3][p_id][d];
            if (visit_val >= 0)
                return colorScalePos(visit_val);
            else
                return colorScaleNeg(Math.abs(visit_val));
        })
        .attr("stroke", "black")
        .style("stroke-width", 1)
        .attr('cursor', 'pointer')
        .on('click', function (e) {
            d3.event.stopPropagation();
            let visit_id = d3.select(this).attr('id').slice(9);
            let visit_val = ptPredData[3][p_id][visit_id];
            let codeData = stratifyData(ptPredData[0][p_id][visit_id], p_id);
            // console.log(ptPredData[3][p_id][visit_id]);
            let code_length = codeData.children.length;
            let code_div_height = (code_length + 5) * 12 + 120;
            let code_div_width = 570;
            let pos_left = this.getBoundingClientRect().x + 18;
            let select_text = '';
            for (let i = 0; i < drug_list.length; i++) {
                select_text = select_text + "<option value=" +
                    drug_list[i] + ">" + drug_dic[drug_list[i]].toLowerCase() + "</option>";
            }
            d3.select('#code-tree' + visit_id).remove();
            let html_text = `
                <div class = 'code-tree-title'>
                   Visit: ${visit_id}, Visit Contribution: ${visit_val}
                </div>
                <div id = 'code-tree-vis${visit_id}' style="width:${code_div_width}px; 
                height: ${code_div_height - 85}px" >
                
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
            renderCodeTree(codeData, code_div_height - 85, code_div_width, visit_id);

        })
        .attr("height", visit_box_height)
        .attr("width", visit_box_width - 2)
        .attr("transform", "translate(0,0)");

    //endregion

    //region code and knowledge graph contribution

    var code_icon_size = 10;

    var code_cont = [];
    var code_kg_cont = [];
    Object.keys(ptPredData[0][p_id]).forEach((visit) => {
        Object.keys(ptPredData[0][p_id][visit]).forEach((code) => {
            code_cont.push(parseFloat(ptPredData[0][p_id][visit][code][0]) + parseFloat(ptPredData[0][p_id][visit][code][1]));
            code_kg_cont.push(+ptPredData[0][p_id][visit][code][1]);
        });
    });
    // code position scale
    var code_cont_range = extendRange(d3.extent(code_cont), 0.3);
    var codeScale = d3.scaleLinear()
        .domain([code_cont_range[0], code_cont_range[1]])
        .range([165, 110]);
    // code color scale: for kg
    var code_kg_cont_range = extendRange(d3.extent(code_kg_cont), 0.5);
    // console.log(code_kg_cont_range);
    var kgColorScalePos = d3.scaleSequential(d3.interpolateReds)
        .domain([0, code_kg_cont_range[1]]);
    var kgColorScaleNeg = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, Math.abs(code_kg_cont_range[0])]);

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
            if (ifTemporal) {
                var date = sinPtData.date[d.visit];
                return xTimeScale(date) + 10;
            } else {
                return xOrdinalScale(d.visit_index) + 10;
            }
        })
        .attr('cy', function (d, i) {
            var code_val = parseFloat(ptPredData[0][p_id][d.visit][d.code][0])
                + parseFloat(ptPredData[0][p_id][d.visit][d.code][1]);
            return codeScale(code_val);
        })
        .style("fill", function (d, i) {
            let code_val = ptPredData[0][p_id][d.visit][d.code][0];
            let kg_val = ptPredData[0][p_id][d.visit][d.code][1];
            if (kg_val > 0) {
                return kgColorScalePos(kg_val);
            } else if (kg_val < 0) {
                // console.log(kg_val);
                return kgColorScaleNeg(Math.abs(kg_val));
            } else {
                return '#fff';
            }
        })
        .style("cursor", "pointer")
        .on("mouseover", function (d, i) {
            //show the code information
            tip.show(d);
        })
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
                // console.log("code val: " + code_val);
                let kg_val = parseFloat(ptPredData[0][p_id][d.visit][d.code][1]).toFixed(3);
                // console.log(ptPredData[0][p_id][d.visit][d.code]);
                let kg_data = ptPredData[2][p_id][d.visit][d.code];   //knowledge graph data, to be finished
                // console.log(kg_data);
                let kg_div_height = 350;
                let kg_div_width = 320;
                let pos_left = this.getBoundingClientRect().x + 10;
                let pos_top = this.getBoundingClientRect().y - 110;
                d3.select('#kg-network' + visit_id + code_id).remove();
                let title_id = 'kg-network' + visit_id + code_id + '-title';
                // var div = d3.select(".main-box").append("div")
                //     .attr('pointer-events', 'none')
                //     .attr('id', 'kg-network' + visit_id + code_id)
                //     .attr("class", "kg-network")
                //     .html("<div class='kg-network-title' id=" + title_id + ">Knowledge Graph</div>" +
                //         "<p class='kg-net-text'>code: " + code_id + "" +
                //         "<br>cont: " + code_val +
                //         "<br>kg cont: " + kg_val + "</p>")
                //     .style("width", kg_div_width + 'px')
                //     .style("height", kg_div_height + 'px')
                //     .style("left", pos_left + 'px')
                //     .style("top", pos_top + 'px');
                ds = 1;
                // let html_text = "<p class='kg-net-text'>code: " + code_id + "" + "<br>cont: " + code_val +
                //     "<br>kg cont: " + kg_val + "</p>";

                let html_text = [code_id, code_val, kg_val];
                renderKGNetwork(kg_data, 500, 370, code_id, visit_id, html_text);
                // dragElement(document.getElementById('kg-network' + visit_id + code_id));
            }
        })
        .on("mouseout", function () {
            d3.select(this).attr("r", 3);
            tip.hide();
        })
        .attr("stroke", "black")
        .style("stroke-width", 0.5)
        .attr("r", 3)
        .attr("transform", "translate(0,0)");


    //endregion

    // region line chart for presenting prediction results
    var visit_comp_line = null;
    var visit_line_comp_points = null;
    var renderCompare = function () {
        if (ifComp == 1) {
            visit_comp_line = svg.append("path")
                .datum(sinPtData.sort_keys)
                .attr("fill", "none")
                .attr('class', 'compLine')
                .attr("stroke", function () {
                    if (ifUpdate)
                        return "#8e44ad";
                    else
                        return "#8e44ad";
                })
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .curve(d3.curveMonotoneX)
                    .x(function (d, i) {
                        if (ifTemporal)
                            return xTimeScale(sinPtData.date[d]) + 10;
                        else
                            return xOrdinalScale(i) + 10;
                    })
                    .y(function (d, i) {
                        var pred_rist = ptPredData[4][p_id][d];
                        return yLineScale(pred_rist) + 20;
                    })
                );

            visit_line_comp_points = svg.append("g")
                .selectAll("dot")
                .data(sinPtData.sort_keys)
                .enter()
                .append("circle")
                .attr('class', 'compCircle')
                .attr("cx", function (d, i) {
                    if (ifTemporal)
                        return xTimeScale(sinPtData.date[d]) + 10;
                    else
                        return xOrdinalScale(i) + 10;
                })
                .attr("cy", function (d) {
                    var pred_rist = ptPredData[4][p_id][d];
                    return yLineScale(pred_rist) + 20;
                })
                .attr("r", 5)
                .attr("fill", function () {
                    if (ifUpdate)
                        return "#8e44ad";
                    else
                        return "#8e44ad";
                });

            // render the legends
            var legend_data = ['DG-RNN', 'DG-RNN-nk'];
            //draw legends:
            var legend = svg.selectAll(".legend")
                .data(legend_data)
                .enter().append("g")
                .attr("class", "comLegend")
                .attr("transform", function (d, i) {
                    return "translate(30," + i * 22 + ")";
                });

            legend.append("circle")
                .attr("cx", width - 118)
                .attr('cy', 12)
                .attr('r', 5)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", function (d, i) {
                    if (d == 'DG-RNN')
                        return '#666666'
                    else
                        return '8e44ad'
                });

            legend.append("text")
                .attr("x", width - 110)
                .attr("y", 12)
                .attr("dy", ".35em")
                .style('font-size', '0.8rem')
                .style("text-anchor", "start")
                .text(function (d, i) {
                    switch (i) {
                        case 0:
                            return "DG-RNN";
                        case 1:
                            return "DG-RNN-nk";
                    }
                });
        } else {
            //remove the comparison line
            d3.selectAll('.compLine').remove();
            d3.selectAll('.compCircle').remove();
            d3.selectAll('.comLegend').remove();
        }
    }
    renderCompare();

    //draw the 0 line to indicate the class
    svg.append('line')
        .style("stroke", "#e74c3c")
        .style("stroke-dasharray", ("3, 3"))
        .style("stroke-width", 1)
        .attr("x1", 30)
        .attr("y1", yLineScale(0.0) + 20)
        .attr("x2", width)
        .attr("y2", yLineScale(0.0) + 20);

    var visit_line = svg.append("path")
        .datum(sinPtData.sort_keys)
        .attr("fill", "none")
        .attr("stroke", function () {
            if (ifUpdate)
                return "#e74c3c";
            else
                return "#666666";
        })
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .curve(d3.curveMonotoneX)
            .x(function (d, i) {
                if (ifTemporal)
                    return xTimeScale(sinPtData.date[d]) + 10;
                else
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
            if (ifTemporal)
                return xTimeScale(sinPtData.date[d]) + 10;
            else
                return xOrdinalScale(i) + 10;
        })
        .attr("cy", function (d) {
            var pred_rist = ptPredData[1][p_id][d];
            if (pred_rist.substring(0, 1) == '[')
                pred_rist = pred_rist.replace('[', '').replace(']', '');
            return yLineScale(pred_rist) + 20;
        })
        .attr("r", 5)
        .attr("fill", function () {
            if (ifUpdate)
                return "#e74c3c";
            else
                return "#666666";
        });

    if (ifUpdate) {
        var old_visit_line = svg.append("path")
            .datum(oldSinPtData.sort_keys)
            .attr("fill", "none")
            .attr("stroke", "#bdc3c7")
            .style("stroke-dasharray", ("3, 3"))
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .curve(d3.curveMonotoneX)
                .x(function (d, i) {
                    if (ifTemporal)
                        return xTimeScaleOld(oldSinPtData.date[d]) + 10;
                    else
                        return xOldOrdinalScale(i) + 10;
                })
                .y(function (d, i) {
                    var pred_rist = oldPredData[1][p_id][d];
                    if (pred_rist.substring(0, 1) == '[')
                        pred_rist = pred_rist.replace('[', '').replace(']', '');
                    return yLineScale(pred_rist) + 20;
                })
            );

        var old_visit_line_points = svg.append("g")
            .selectAll("dot")
            .data(oldSinPtData.sort_keys)
            .enter()
            .append("circle")
            .attr("cx", function (d, i) {
                if (ifTemporal)
                    return xTimeScaleOld(oldSinPtData.date[d]) + 10;
                else {
                    return xOldOrdinalScale(i) + 10;
                }
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
    }

    // endregion

    //region draw axis

    //the x axis of contribution chart
    var x_axis = d3.axisBottom()
        .tickFormat(function (d, i) {
            if (i != 0 & i != xRange.length - 1) {
                var a_id = sinPtData.sort_keys[i - 1];
                return "v" + i;
            } else
                return 1;
        })
        .scale(xOrdinalScale);

    var x_time_axis = d3.axisBottom()
        .tickFormat(d3.timeFormat("%Y-%m-%d"))
        .scale(xTimeScale);

    //Append group and insert axis
    if (ifTemporal) {
        svg.append("g")
            .attr("transform", "translate(10," + (height - 20) + ")")
            .attr("class", 'code-time-axis')
            .call(x_time_axis)
            .selectAll("text")
            .attr("x", 0)
            .attr("y", 10)
            .attr("transform", "rotate(0)");
    } else {
        svg.append("g")
            .attr("transform", "translate(10," + (height - 20) + ")")
            .call(x_axis)
            .selectAll("text")
            .attr("x", 0)
            .attr("y", 10)
            .attr("transform", "rotate(0)");
    }


    var ticks = d3.selectAll(".tick");
    ticks.each(function (_, i) {
        if (i == 0) d3.select(this).remove();
        if (i == xRange.length - 1) d3.select(this).remove();
    });

    //code contribution y axis
    var y_axis = d3.axisLeft()
        .scale(codeScale)
        .ticks(5);

    svg.append("g")
        .attr("class", "code_axis")
        .attr("transform", "translate(30, 0)")
        .call(y_axis);

    //line chart axis
    var x_linechart_axis = d3.axisBottom()
        .tickFormat("")
        .scale(xOrdinalScale);

    var x_linechart_time_axis = d3.axisBottom()
        .tickFormat("")
        .scale(xTimeScale);

    //Append group and insert axis
    //https://stackoverflow.com/questions/19787925/create-a-d3-axis-without-tick-labels
    if (ifTemporal) {
        svg.append("g")
            .attr("transform", "translate(10," + (height - 130) + ")")
            .attr("class", "line-axis")
            .call(x_linechart_time_axis)
            .selectAll("text")
            .attr("x", 0)
            .attr("y", 0)
            // .attr("dy", 20)
            .attr("transform", "rotate(0)");
    } else {
        svg.append("g")
            .attr("transform", "translate(10," + (height - 130) + ")")
            .call(x_linechart_axis)
            .selectAll("text")
            .attr("x", 0)
            .attr("y", 0)
            // .attr("dy", 20)
            .attr("transform", "rotate(0)");
    }

    var y_line_axis = d3.axisLeft()
        .scale(yLineScale)
        .ticks(5);

    svg.append("g")
        .attr("class", "y_line_axis")
        .attr("transform", "translate(30, 20)")
        .call(y_line_axis);


    //endregion

    //region zoom event
    function zoomed() {
        if (ifTemporal == 0) {
            var newCodeScale = d3.event.transform.rescaleY(codeScale);
            svg.select(".code_axis").call(y_axis.scale(newCodeScale));
            svg.selectAll('.codebox')
                .attr('cy', function (d, i) {
                    var code_val = ptPredData[0][p_id][d.visit][d.code][0];
                    return newCodeScale(code_val);
                });
        } else {
            if (ifTempMode) {
                //temporal scale
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
                if (ifComp) {
                    visit_comp_line.attr("d", d3.line()
                        .curve(d3.curveMonotoneX)
                        .x(function (d, i) {
                            return newTimeScale(sinPtData.date[d]) + 10;
                        })
                        .y(function (d, i) {
                            var pred_rist = ptPredData[4][p_id][d];
                            return yLineScale(pred_rist) + 20;
                        })
                    );
                    visit_line_comp_points.attr("cx", function (d, i) {
                        return newTimeScale(sinPtData.date[d]) + 10;
                    });
                }
                if (ifUpdate) {
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
                    old_visit_line_points.attr("cx", function (d, i) {
                        return newTimeScaleOld(oldSinPtData.date[d]) + 10;
                    });
                }
                visit_line_points.attr("cx", function (d, i) {
                    return newTimeScale(sinPtData.date[d]) + 10;
                });
                svg.select(".code-time-axis").call(x_time_axis.scale(newTimeScale));
                svg.select(".line-axis").call(x_linechart_time_axis.scale(newTimeScale));
            } else {
                var newCodeScale = d3.event.transform.rescaleY(codeScale);
                svg.select(".code_axis").call(y_axis.scale(newCodeScale));
                svg.selectAll('.codebox')
                    .attr('cy', function (d, i) {
                        var code_val = parseFloat(ptPredData[0][p_id][d.visit][d.code][0])
                + parseFloat(ptPredData[0][p_id][d.visit][d.code][1]);
                        return newCodeScale(code_val);
                    });
            }
        }


    }

    //endregion
}

/**
 * extend the range of an array contains min and max
 * extend_coef: the extend_coef to extend
 * @param range_arr
 */
function extendRange(range_arr, extend_coef) {
    var max = range_arr[1];
    var min = range_arr[0];
    max = max + Math.abs(max) * extend_coef;
    min = min - Math.abs(min) * extend_coef;
    var extended_arr = [min, max];
    return extended_arr;

}

/**
 * remove history view (svg)
 */
function resetHistory(ifTemporal) {
    $('#svg_history').remove();
    d3.selectAll(".code-tree").remove();
    d3.selectAll(".kg-network").remove();
    selectedCode = clone(currentCode);
    updateCodeList();
    renderPtHistory(gPID, gSinPtData, gPtPredData, gSinPtData, gPtPredData, 0, ifTemporal);
}

/**
 * clean all visualizations
 */
function cleanVis() {
    $('#svg_history').remove();
    updateCodeList();
    d3.selectAll(".code-tree").remove();
    d3.selectAll(".kg-network").remove();
}

/**
 * render code tree using hierarchy and tree map
 * @param codeData: json format hierarchical data
 */
function renderCodeTree(codeData, height, width, visit_id) {
    // Set the dimensions and margins of the diagram

    var svg = d3.select("#code-tree-vis" + visit_id).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate("
            + 0 + "," + 0 + ")");

    var i = 0,
        duration = 500,
        root;

    // declares a tree layout and assigns the size
    var treemap = d3.tree().size([height, width]);

    // Assigns parent, children, height, depth
    root = d3.hierarchy(codeData, function (d) {
        return d.children;
    });
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after the second level
    root.children.forEach(collapse);

    update(root);

    // Collapse the node and all it's children
    function collapse(d) {
        if (d.children) {
            d._children = d.children
            d._children.forEach(collapse)
            d.children = null
        }
    }

    function update(source) {

        // Assigns the x and y position for the nodes
        var treeData = treemap(root);

        // Compute the new tree layout.
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            d.y = d.depth * 140
        });

        // ****************** Nodes section ***************************

        // Update the nodes...
        var node = svg.selectAll('g.node')
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 3)
            .style("fill", function (d) {
                return d._children ? "#fff" : "#999";
            });

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("dy", ".35em")
            .style("font", "10px sans-serif")
            .attr("x", function (d) {
                return d.children || d._children ? -13 : 13;
            })
            .attr("text-anchor", function (d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(d => {
                return d.children ? '' : ptTestData[2][d.data.name] + "\xa0\xa0\xa0" + "code cont:" +
                    parseFloat(d.data.cont).toFixed(2) +
                    "\xa0\xa0\xa0\xa0\xa0\xa0" + 'kg cont:' + parseFloat(d.data.kg_cont).toFixed(2);
            });

        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 3)
            .style("fill", function (d) {
                return d.children ? "#fff" : "#999";
            })
            .attr('cursor', 'pointer');


        // Remove any exiting nodes
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 3);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e6);

        // ****************** links section ***************************

        // Update the links...
        var link = svg.selectAll('path.link')
            .data(links, function (d) {
                return d.id;
            });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5)
            .attr('d', function (d) {
                var o = {x: source.x0, y: source.y0}
                return diagonal(o, o)
            });

        // UPDATE
        var linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', function (d) {
                return diagonal(d, d.parent)
            });

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function (d) {
                var o = {x: source.x, y: source.y}
                return diagonal(o, o)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {

            path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

            return path
        }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
    }
}

/**
 * stratify code data into hierarchical format
 * @param codeData
 */
function stratifyData(codeData, pid) {
    //sort data by contribution score
    let sorted_codes = Object.keys(codeData).sort((a, b) => {
        return codeData[b][0] - codeData[a][0];
    });
    //build hierarchical data
    let childs = [];
    sorted_codes.forEach(key => {
        let child_attr = new Object();
        child_attr['name'] = key;
        child_attr['cont'] = codeData[key][0];
        child_attr['kg_cont'] = codeData[key][1];
        childs.push(child_attr);
    });
    let res = new Object();
    res['name'] = pid;
    res['children'] = childs;
    return res;
}

/**
 *
 * @param kgData
 * @returns {Object}
 */
function stratifyKGData(kgData) {
    var graph = new Object();
    let nodes = new Array();
    let links = new Array();
    if (kgData.length == 0)
        return graph;
    //build nodes
    for (let i = 0; i <= kgData.length; i++) {
        let node = new Object();
        if (i == kgData.length) {
            let kg_item = kgData[0].split('\', ');
            node['name'] = kg_item[0].substring(2, kg_item[0].length);
            node['id'] = i;
            node['isTarget'] = 1;
            node['weight'] = 1;
        } else {
            let kg_item = kgData[i].split('\', ');
            node['name'] = kg_item[2].substring(1, kg_item[2].length);
            node['id'] = i;
            node['isTarget'] = 0;
            node['weight'] = parseFloat(kg_item[3].substring(0, kg_item[3].length - 1));
        }
        nodes.push(node);
    }
    //build links
    for (let i = 0; i < kgData.length; i++) {
        let link = new Object();
        let kg_item = kgData[i].split('\', ');
        let relation = kg_item[1].substring(1, kg_item[1].length).toLowerCase().replace(/_/g, ' ');
        let isa_flag = relation.substring(0, 2) == 'is' ? 1 : 0;
        let edge_weight = kg_item[3].substring(0, kg_item[3].length - 1);
        if (isa_flag == 1) {
            link['source'] = kgData.length;
            link['target'] = i;
            link['weight'] = edge_weight;
            link['type'] = relation;
        } else {
            link['source'] = i;
            link['target'] = kgData.length;
            link['weight'] = edge_weight;
            link['type'] = relation;
        }
        links.push(link);
    }
    graph['nodes'] = nodes;
    graph['links'] = links;
    return graph;

}


/**
 * render the knowledge graph network, using directed force network
 * render the relationship between nodes
 * @param kgData
 */
function renderKGNetwork(kgData, width, height, code_id, visit_id, html_text) {
    d3.selectAll(".detail-kg").remove();
    if (kgData.length == 0)
        return;
    let graph = stratifyKGData(kgData);

    for (let i = 0; i < graph.nodes.length; i++) {
        let isTarget = graph.nodes[i]['isTarget'];
        if (isTarget == 1) {
            //highlight knowledge graph
            highLightDetailKG(graph.nodes[i]['name']);
        }
    }

    var kg_cont_arr = [];
    graph.links.forEach((d) => {
        kg_cont_arr.push(d.weight);
    });
    let kg_max = d3.max(kg_cont_arr);
    let kg_min = d3.min(kg_cont_arr);

    var kg_size_scale = d3.scaleLinear()
        .domain([kg_min, kg_max])
        .range([3, 6]);


    var svg = d3.select("#sel-kg-vis").append("svg")
        .attr("class", 'detail-kg')
        .attr("width", width)
        .attr("height", height)
        .attr("transform",
            "translate(" + 20 + "," + 0 + ")");

    svg.append("text")
        .attr("dy", 20)
        .attr('font-size', 14)
        .text("code name: " + ptTestData[2][html_text[0]]);
    svg.append("text")
        .attr("dy", 40)
        .attr('font-size', 14)
        .text("code value: " + html_text[1]);
    svg.append("text")
        .attr("dy", 60)
        .attr('font-size', 14)
        .text("knowledge graph contribution: " + html_text[2]);
    svg.append("text")
        .attr("dy", 80)
        .attr('font-size', 14)
        .text("total contribution: " + (parseFloat(html_text[2]) + parseFloat(html_text[1])));

    var node, link;

    svg.append('defs').append('marker')
        .attrs({
            'id': 'arrowhead',
            'viewBox': '-0 -5 10 10',
            'refX': 13,
            'refY': 0,
            'orient': 'auto',
            'markerWidth': 10,
            'markerHeight': 10,
            'xoverflow': 'visible'
        })
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#34495e')
        .style('stroke', 'none');

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.id;
        }).distance(120).strength(1))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2 + 20, height / 2 + 20));


    update(graph.links, graph.nodes);


    function update(links, nodes) {
        link = svg.selectAll(".link")
            .data(links)
            .enter()
            .append("line")
            .attr("class", "kg-link")
            .attr('marker-end', 'url(#arrowhead)')

        link.append("title")
            .text(function (d) {
                return d.type;
            });

        edgepaths = svg.selectAll(".edgepath")
            .data(links)
            .enter()
            .append('path')
            .attrs({
                'class': 'edgepath',
                'fill-opacity': 0,
                'stroke-opacity': 0,
                'id': function (d, i) {
                    return 'edgepath' + visit_id + code_id + i
                }
            })
            .style("pointer-events", "none");

        edgelabels = svg.selectAll(".edgelabel")
            .data(links)
            .enter()
            .append('text')
            .style("pointer-events", "none")
            .attrs({
                'class': 'edgelabel',
                'id': function (d, i) {
                    return 'edgelabel' + visit_id + code_id + i
                },
                'font-size': 10,
                'fill': '#000'
            });

        edgelabels.append('textPath')
            .attr('xlink:href', function (d, i) {
                return '#edgepath' + visit_id + code_id + i
            })
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(function (d) {
                let weight = parseFloat(d.weight).toFixed(3);
                return d.type + ': ' + weight;
            });

        node = svg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                //.on("end", dragended)
            );

        node.append("circle")
            .attr("r", (d, i) => {
                if (d.isTarget == 1) {
                    return 5;
                } else {
                    return kg_size_scale(d.weight);
                }
            })
            .style("fill", function (d, i) {
                if (d.isTarget == 1) {
                    return '#ca5745';
                } else {
                    return '#2980b9';
                }
            });

        node.append("title")
            .text(function (d) {
                return d.id;
            });

        node.append("text")
            .attr("dy", -3)
            .attr('font-size', 10)
            .text(function (d) {
                return ptTestData[2][d.name];
            });

        simulation
            .nodes(nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(links);
    }

    function ticked() {
        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        node
            .attr("transform", function (d) {
                return "translate(" + d.x + ", " + d.y + ")";
            });

        edgepaths.attr('d', function (d) {
            return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
        });

        edgelabels.attr('transform', function (d) {
            if (d.target.x < d.source.x) {
                var bbox = this.getBBox();

                rx = bbox.x + bbox.width / 2;
                ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            } else {
                return 'rotate(0)';
            }
        });
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
}


/**
 * convert arr to arr that contains obj
 * @param arr
 */
function arrToObject(arr, val, index) {
    objArr = [];

    for (var i = 0; i < arr.length; ++i) {
        var rv = {};
        rv['code'] = arr[i];
        rv['visit'] = val;
        rv['visit_index'] = index;
        objArr.push(rv);
    }
    return objArr;
}

/**
 * convert code list object to dict
 * @param code, all medical codes of a patient
 */
function codeToDict(code) {
    let dict = new Object();
    let visits = new Object();
    let keys = Object.keys(code);
    keys.forEach((key) => {
        let visit_id = key.split('-')[0];
        let code_id = key.split('-')[1];
        if (code[key] != 0) {
            if (visit_id in visits) {
                visits[visit_id].push(code_id);
            } else {
                visits[visit_id] = [code_id];
            }
        }
    });
    dict[gPID] = visits;
    return dict;
}

/**
 * convert dict object to code list
 * @param dict, all medical codes store in a dictionary
 */
function dictToCode(dict) {
    let code = new Object();
    p_id = Object.keys(dict)[0];
    Object.keys(dict[p_id]).forEach((visit_id) => {
        for (let i = 0; i < dict[p_id][visit_id].length; i++) {
            let code_id = dict[p_id][visit_id][i];
            code[visit_id + '-' + code_id] = 1;
        }
    });
    return code;
}

/**
 * update the record of a single patient according to the new results.
 * @param sinPtData
 */
function updateSinPtData(sinPtData, new_dict) {
    let newSinPtData = clone(sinPtData);
    newSinPtData.admission = new_dict[gPID];
    let visits = Object.keys(new_dict[gPID]);
    let old_visits = Object.keys(sinPtData.admission);
    let diff = old_visits.diff(visits);
    diff.forEach((d) => {
        delete newSinPtData.date[d];
        newSinPtData.sort_keys.remove(d);
    });
    return newSinPtData;
}

/**
 * update the side bar of code list, added drugs, and removed codes
 */
function updateCodeList() {
    let added_tags = '';
    let remove_tags = '';
    Object.keys(selectedCode).forEach((key, idx) => {
        if (selectedCode[key] == 0) {
            let visit = key.split('-')[0];
            let code = key.split('-')[1];
            let name = ptTestData[2][code];
            remove_tags = remove_tags + "<span class ='badge badge-warning drug-tag'>"
                + visit + ': ' + name.toLowerCase().substring(0, 10) + "</span> <br>";
        } else if (selectedCode[key] == 2) {
            let visit = key.split('-')[0];
            let code = key.split('-')[1];
            added_tags = added_tags + "<span class ='badge badge-success drug-tag'>"
                + drug_dic[code].toLowerCase().substring(0, 20) + "</span> <br>";
        }
    });
    $('#added-drugs').html(added_tags);
    $('#removed-codes').html(remove_tags);
}

