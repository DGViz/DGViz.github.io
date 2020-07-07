/**
 * @Description render the knowledge graph using sigma
 * @Author: Rui Li
 * @Date: 1/12/20
 */

/**
 * render the konwledge graph
 */


/**
 * put the node at the end of nodesArray
 */
sigma.classes.graph.addMethod('reorderNodes', function (id) {
    var l = this.nodesArray.length;
    var temp = null;
    //remove node from the nodesArray
    for (let i = 0; i < l; i++)
        if (this.nodesArray[i].id === id) {
            temp = this.nodesArray.splice(i, 1);
            break;
        }
    //push the node into the end
    this.nodesArray.push(temp[0]);
    return this;
});

/**
 * put the edge at the end of the edgesArray
 */
sigma.classes.graph.addMethod('reorderEdges', function (id) {
    var l = this.edgesArray.length;
    var temp = null;
    //remove edge from the edgesArray
    for (let i = 0; i < l; i++)
        if (this.edgesArray[i].id === id) {
            temp = this.edgesArray.splice(i, 1);
            break;
        }
    //push the edge into the end
    this.edgesArray.push(temp[0]);
    return this;
});

/**
 * find the neighbors of a node by id
 */
sigma.classes.graph.addMethod('neighbors', function (nodeId) {
    var k,
        neighbors = {},
        index = this.allNeighborsIndex[nodeId] || {};

    for (k in index)
        neighbors[k] = this.nodesIndex[k];

    return neighbors;
});

/**
 * find node by id
 * @param sigmaInstance
 * @param key
 * @param value
 * @returns {*}
 */
function lookupNodesByKeyValue(sigmaInstance, key, value) {
    return sigmaInstance.graph.nodes().filter(node => node[key] === value);
}

function lookupNodeByKeyValue(sigmaInstance, key, value) {
    return lookupNodesByKeyValue(sigmaInstance, key, value).pop();
}

function lookupNodeById(sigmaInstance, value) {
    return lookupNodeByKeyValue(sigmaInstance, 'id', value);

}

var s = null;
var ds = 0;  //detail network

/**
 * render the whole knowledge graph
 */
function renderKG() {
    // initialize sigma:
    s = new sigma(
        {
            renderer: {
                container: document.getElementById('kg-vis'),
                type: 'SVG'
            },
            settings: {
                labelThreshold: 6,
                zoomMax: 10,
                zoomMin: 0.0001,
                autoRescale: false,
                // drawLabels: false,
            }
        }
    );

    // initialize dataset
    s.graph.read(ptTestData[3]);
    //s.graph.read(graph);

    //save the original color of our nodes and edges
    s.graph.nodes().forEach(function (n) {
        n.originalColor = n.color;
        n.originalSize = n.size;
    });
    s.graph.edges().forEach(function (e) {
        e.originalColor = e.color;
        e.originalSize = e.size;
    });


    /**
     * click event, when the node is clicked, check for each code,
     * if it is a neighbor of the clicked one, do noting, else, set its color as grey.
     * then, for edges, we only keep edges that have both extremities colored
     */
    s.bind('clickNode', function (e) {
        var nodeId = e.data.node.id,
            toKeep = s.graph.neighbors(nodeId);
        toKeep[nodeId] = e.data.node;

        Object.keys(toKeep).forEach((d, i) => {
            s.graph.reorderNodes(d);
        });

        s.graph.nodes().forEach(function (n) {
            if (toKeep[n.id]) {
                n.color = '#c0392b';
                n.size = 8;
            } else {
                n.color = "#557a97";
                n.size = 4;
            }
        });

        s.graph.edges().forEach(function (e) {
            if (toKeep[e.source] && toKeep[e.target]) {
                s.graph.reorderEdges(e.id);
                e.color = '#c0392b';
                e.size = e.originalSize * 5;
            } else {
                e.size = e.originalSize;
                e.color = e.originalColor;
            }
        });

        s.refresh();
    });

    // When the stage (blank area) is clicked, we just color each
    // node and edge with its original color.
    s.bind('clickStage', function (e) {
        if (!e.data.captor.isDragging) {

            s.graph.nodes().forEach(function (n) {
                n.color = n.originalColor;
                n.size = n.originalSize;
            });

            s.graph.edges().forEach(function (e) {
                e.color = e.originalColor;
                e.size = e.originalSize;
            });

            // Same as in the previous event:
            s.refresh();
        }

    });

    // render the network
    s.cameras[0].goTo({x: 0, y: 0, angle: 0, ratio: 10});
    s.refresh();


    s.startForceAtlas2();
    window.setTimeout(function () {
        s.killForceAtlas2()
    }, 10000);

}

/**
 * highlight the corresponding node in the network
 * @param p_id
 * @param sinPtData
 * @param ptPredData
 */
function highLightKG(p_id, sinPtData, ptPredData) {

    //find all nodes with knowledge graph
    var kg_data = ptPredData[2][p_id];
    var kg_nodes = [];

    Object.keys(kg_data).forEach((d, i) => {
        let code_data = kg_data[d];
        Object.keys(code_data).forEach((p, j) => {
            if (code_data[p].length != 0) {
                kg_value = code_data[p][0];
                kg_id = kg_value.split(', ')[0].substring(1).replace(/'/g, '');
                kg_nodes.push(kg_id);
            }
        });
    });
    kg_nodes = [...new Set(kg_nodes)];

    for (let i = 0; i < kg_nodes.length; i++) {
        var nodeId = kg_nodes[i];
        var toKeep = s.graph.neighbors(nodeId);
        toKeep[nodeId] = lookupNodeById(s, nodeId);
    }

    Object.keys(toKeep).forEach((d, i) => {
        s.graph.reorderNodes(d);
    });

    s.graph.nodes().forEach(function (n) {
        if (toKeep[n.id]) {
            n.color = '#c0392b';
            n.size = 8;
        } else {
            n.color = "#557a97";
            n.size = 4;
        }
    });

    s.graph.edges().forEach(function (e) {
        if (toKeep[e.source] && toKeep[e.target]) {
            s.graph.reorderEdges(e.id);
            e.color = '#c0392b';
            e.size = e.originalSize * 5;
        } else {
            e.size = e.originalSize;
            e.color = e.originalColor;
        }
    });

    s.refresh();


}

/**
 * render a subset of kg
 * @param graph
 */
function renderSelKG(graph) {
    ds = new sigma(
        {
            renderer: {
                container: document.getElementById('sigma-container'),
                type: 'canvas'
            },
            settings: {
                edgeLabelSize: 'proportional',
                minArrowSize: 10
            }
        }
    );

    s.graph.read(graph);
    // draw the graph
    s.refresh();
    // launch force-atlas for 5sec
    s.startForceAtlas2();
    window.setTimeout(function () {
        s.killForceAtlas2()
    }, 5000);
}


function resetKG() {
    s.graph.nodes().forEach(function (n) {
        n.color = n.originalColor;
        n.size = n.originalSize;
    });

    s.graph.edges().forEach(function (e) {
        e.color = e.originalColor;
        e.size = e.originalSize;
    });

    // Same as in the previous event:
    s.refresh();
}

/**
 * highlight the detail code knowledge graph
 * @param k_id
 */
function highLightDetailKG(k_id) {

    // console.log(k_id);
    var nodeId = k_id;
    var toKeep = s.graph.neighbors(nodeId);
    toKeep[nodeId] = lookupNodeById(s, nodeId);

    Object.keys(toKeep).forEach((d, i) => {
        s.graph.reorderNodes(d);
    });

    s.graph.nodes().forEach(function (n) {
        if (toKeep[n.id]) {
            n.color = '#c0392b';
            n.size = 8;
        } else {
            n.color = "#557a97";
            n.size = 4;
        }
    });

    s.graph.edges().forEach(function (e) {
        if (toKeep[e.source] && toKeep[e.target]) {
            s.graph.reorderEdges(e.id);
            e.color = '#c0392b';
            e.size = e.originalSize * 5;
        } else {

            e.size = e.originalSize;
            e.color = e.originalColor;
        }
    });

    s.refresh();
}




