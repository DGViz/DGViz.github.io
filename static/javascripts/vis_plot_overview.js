/**
 * @Description draw overview visualization
 * @Author: Rui Li
 * @Date: 9/25/19
 */

/**
 * draw overview scatter plot
 * @param data: input data, 2D patient data
 */

var selectedPid = 0;

function plotOverview(data) {

    var width = 450,
        height = 370,
        margin = 10;

    //format data
    data.forEach(function (d) {
        d.x = parseFloat(d.X);
        d.y = parseFloat(d.Y);
        d.p_id = d.PID;
        d.gt = +d.LABEL;
        d.pred = +d.PREDICT;
    });

    //scale
    var xLowest = d3.min(data, function (d) {
        return d.x;
    });
    var xHighest = d3.max(data, function (d) {
        return d.x;
    });
    var yLowest = d3.min(data, function (d) {
        return d.y;
    });
    var yHighest = d3.max(data, function (d) {
        return d.y;
    });

    var x = d3.scaleLinear()
        .domain([xLowest, xHighest])
        .range([margin, width - margin])

    var y = d3.scaleLinear()
        .domain([yLowest, yHighest])
        .range([height - margin, margin])

    // Pan and zoom
    var zoom = d3.zoom()
        .scaleExtent([.5, 20])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    function zoomed() {
        // create new scale ojects based on event
        var new_xScale = d3.event.transform.rescaleX(x);
        var new_yScale = d3.event.transform.rescaleY(y);
        points.data(data)
            .attr('cx', function (d) {
                return new_xScale(d.x)
            })
            .attr('cy', function (d) {
                return new_yScale(d.y)
            });
    }

    var svg = d3.select('.overview-vis').append("svg")
        .attr("id", function (d, i) {
            return "svg_overview";
        })
        .attr("class", "svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

    var points = svg.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('id', function (d, i) {
            return "id" + d.p_id;
        })
        .attr('cx', function (d, i) {
            return x(d.x);
        })
        .attr('cy', function (d) {
            return y(d.y);
        })
        .attr("class", 'overview-dots')
        .attr('isSelected', 0)
        .attr("transform", "translate(0,0)")
        .on("mouseover", function (d, i) {
            d3.select(this).attr("r", 6);
            d3.select(this).style("opacity", "0.9");
            d3.select(this).style("cursor", "pointer");
            d3.select(this).style("fill", "#2ecc71");
        })
        .on("click", function () {

            let clickedID = d3.select(this).attr("id").substring(2);
            if(((clickedID == '836092410') | (clickedID == '884625528') | (clickedID == '951367515'))!=true){
                return '#000';
            }
            else{
                if (selectedPid != 0) {
                    d3.select('#' + selectedPid).attr("r", 4);
                    d3.select('#' + selectedPid).style("opacity", "0.7");
                    d3.select('#' + selectedPid).style("cursor", "default");
                    d3.select('#' + selectedPid).style("fill", function (d, i) {
                        if (d.pred == 1)
                            return '#d46d65';
                        else
                            return '#698eb2';
                    });
                }
                
                d3.selectAll('.overview-dots').attr("isSelected", 0);
                d3.select(this).attr("isSelected", 1);
                d3.select(this).style("fill", "#27ae60");
                selectedPid = d3.select(this).attr("id");
                sub_id = d3.select(this).attr("id").substring(2);
                //console.log(sub_id);
                $('#svg_history').remove();
    
                getSelectedPatientInfo(sub_id);
            }
            
            
        })
        .on("mouseout", function () {
            if (d3.select(this).attr("isSelected") != 1) {
                d3.select(this).attr("r", 4);
                d3.select(this).style("opacity", "0.7");
                d3.select(this).style("cursor", "default");
                d3.select(this).style("fill", function (d, i) {
                    if (d.pred == 1)
                        return '#d46d65';
                    else
                        return '#698eb2';
                });
                
            }
        })
        .style("fill", function (d, i) {
            
            if (d.pred == 1)
                return '#d46d65';
            else if(d.pred == 0){
                return '#698eb2';
            }

        })
        .attr("stroke", function(d, i){
            //potential useful: 220091082
            if((d.PID == '836092410') | (d.PID == '884625528') | (d.PID == '951367515')){
                return '#000';
            }
            else{
                return "#ecf0f1";
            }
        })
        .attr("stroke-width", function(d, i){
            //potential useful: 220091082
            if((d.PID == '836092410') | (d.PID == '884625528') | (d.PID == '951367515')){
                return 2;
            }
            else{
                return 1;
            }
        })
        .style("opacity", "0.7")
        .attr('r', 4);


}





