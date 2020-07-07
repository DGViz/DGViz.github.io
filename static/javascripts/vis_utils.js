/**
 * @Description math utils
 * @Author: Rui Li
 * @Date: 9/24/19
 */

const average = (array) => array.reduce((a, b) => a + b) / array.length;


function sortDate(myArray) {
    myArray.sort(function (a, b) {
        return a.ROW_ID - b.ROW_ID;
    });
    return myArray;
}

/**
 *
 * @param object that requires to be sorted
 * @returns the array of sorted keys
 * https://stackoverflow.com/questions/1069666/sorting-javascript-object-by-property-value
 * https://stackoverflow.com/questions/5467129/sort-javascript-object-by-key
 */
function sortObjectByValue(o) {
    return Object.keys(o).sort(function (a, b) {
        return o[a] - o[b]
    })
}

/**
 * return the difference between two array
 * @param a
 * @returns {*[]}
 */
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

/**
 * remove a value from array
 * @returns {Array}
 */
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

/**
 * convert Date object to string
 * @param date
 */
Date.prototype.toShortFormat = function () {

    var month_names = ["Jan", "Feb", "Mar",
        "Apr", "May", "Jun",
        "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec"];

    var day = this.getDate();
    var month_index = this.getMonth();
    var year = this.getFullYear();

    return "" + day + "-" + month_names[month_index] + "-" + year;
}

/**
 * clone an object
 * @param obj
 * @returns {{}|Array|Date|*}
 */
function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

/**
 * convert arr to arr that contains obj
 * @param arr
 */
function arrToObject(arr, val) {
    objArr = [];

    for (var i = 0; i < arr.length; ++i) {
        var rv = {};
        rv['code'] = arr[i];
        rv['visit'] = val;
        objArr.push(rv);
    }
    return objArr;
}

/**
 * drag div element
 * @param elmnt
 */
function dragElement(elmnt) {

    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "-title")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "-title").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        console.log(1);
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}