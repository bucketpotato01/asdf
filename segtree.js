
const nodeColor = 'white';   // color to fill the nodes with
const nodeBorder = 'black';  // color of the borders of the nodes
const nodeBorderWidth = 1;   // name is self-explanatory
const nodeSize = 15;         // radius of the nodes on the svg
const markColor = '#ffd7d4'  // the color for marking nodes
const markWidth = 2;         // radius of marked nodes' borders
const queryMark = '#ffa6a6'  // color of marked queried nodes

const textOffset = 4;        // make the nodes pretty
const textSize = 'x-small'     // size of the text in the nodes
const maxDatumValue = 99;    // maximum absolute value of values in the segment tree

// helpful for working with IDs in the html file
const nodeIdPrefix = "stVisNode";  // prefix for the ID of a node on the svg
const textIDPrefix = "stText"      // prefix for the ID of text
const edgeIDPrefix = "stEdge";     // prefix for ID of an edge
const outlineIDPrefix = "outline"; // prefix for ID of a outline
const stVisID = "stvis";           // ID of the svg
const valInputID = "valueInput";   // ID of the value input
const indInputID = "indexInput";   // ID of the index input
const lInputID = "linput";
const rInputID = "rinput";
const controlID = "controls";      // ID of the control panel
const whereToWrite = "outputText"; // ID of the div to put text onto
const selectionBar = "selectionBar";
const aboutOption = "about";
const queryOption = "query";
const updateOption = "update";


// information about the segment tree
var arrSize = 16; // the size of the array
var stsize;       // the total size of the segment tree
var bstart;       // (stsize + 1) / 2 - 1
var datums = [];  // stores the segment tree
var paredge = []; // the ids of the edges to a node's parents
var maxDepth;     // the max depth of the segment tree

// visualization related
var marks = [];
const outOfBounds = "Index out of bounds.";

function vis() { return document.getElementById(stVisID); }

// adds a node to the svg
function createNode(x, y, val, currID) {

	var displayNode = document.createElement('g');

	var circle = document.createElement('circle');
	circle.setAttribute('cx', x);
	circle.setAttribute('cy', y);
	circle.setAttribute('r', nodeSize);
	circle.setAttribute('stroke', nodeBorder);
	circle.setAttribute('stroke-width', nodeBorderWidth);
	circle.setAttribute('fill', nodeColor);
	circle.setAttribute('id', outlineIDPrefix + currID);
	displayNode.appendChild(circle);

	var temp = document.createElement('text');
	temp.setAttribute('x', x);
	temp.setAttribute('y', y + textOffset);
	temp.setAttribute('text-anchor', 'middle');
	temp.setAttribute('font-size', textSize);
	temp.setAttribute('id', textIDPrefix + currID);
	temp.innerHTML = val;
	displayNode.appendChild(temp);

	// displayNode.innerHTML += createText(x, y, val);
	displayNode.setAttribute('id', nodeIdPrefix + currID);

	vis().appendChild(displayNode);
	vis().innerHTML += "";

}

// removes the specified element from the svg
function removeFromDoc(id) { document.getElementById(id).remove(); }

// takes in the depth and the position of the node at that depth
// returns the x/y coordinates
// finished - if not finished, moves the node up a bit
function getCoords(dep, which, finished = true) {

	var numnodes = 2 ** dep;

	var canvasWidth = document.getElementById(stVisID).width.animVal.value;
	var canvasHeight = document.getElementById(stVisID).height.animVal.value;

	var nv = numnodes + 1;
	var x = (canvasWidth / nv) * (which + 1);
	var y = (canvasHeight / (maxDepth + 2)) * (dep + 1);

	if (finished == false)
		y -= unfinishedOffset;

	return [x, y];

}

// moves the specified element by the specified x and y
function moveThing(id, x, y) {

	var container = document.getElementById(nodeIdPrefix + id);
	if (container == null) return;
	var transformNode = 'translate(' + x + ',' + y + ')';
	container.setAttribute('transform', transformNode);

}

// geometry - a point dToWalk away from coords in the direction towards goal
function walkTo(coords, goal, dToWalk) {
	var tdist = ((goal[1] - coords[1])**2 + (goal[0] - coords[0])**2) ** 0.5;
	var xratio = (goal[0] - coords[0]) / tdist;
	var cdx = xratio * dToWalk;
	var yratio = (goal[1] - coords[1]) / tdist;
	var cdy = yratio * dToWalk;
	return [coords[0] + cdx, coords[1] + cdy];
}

// creates an edge between two nodes
function makeLine(pd, pa, cd, ca, id) {
	if (pd == -1 || pa == -1) return false;
	if (cd == -1 || ca == -1) return false;
	var par = getCoords(pd, pa);
	var cur = getCoords(cd, ca);

	var temp1 = walkTo(par, cur, nodeSize);
	var temp2 = walkTo(cur, par, nodeSize);

	par = temp1;
	cur = temp2;

	var cline = document.createElement('line');
	cline.setAttribute('x1', par[0]);
	cline.setAttribute('y1', par[1]);
	cline.setAttribute('x2', cur[0]);
	cline.setAttribute('y2', cur[1]);
	cline.setAttribute('id', edgeIDPrefix + id);
	cline.setAttribute('stroke-width', 1);
	cline.setAttribute('stroke', 'black');
	vis().appendChild(cline);
	vis().innerHTML += "";
	return true;
}

// recursively draws the segment tree
function drawRecursive(c, cdep, cacross) {

	var ccoords = getCoords(cdep, cacross);
	createNode(ccoords[0], ccoords[1], datums[c], c);

	if (c >= bstart) return;

	var a1 = cacross * 2;
	var a2 = cacross * 2 + 1;

	var c1c = getCoords(cdep + 1, a1);
	var c2c = getCoords(cdep + 1, a2);

	makeLine(cdep, cacross, cdep + 1, a1, paredge[c * 2 + 1]);
	makeLine(cdep, cacross, cdep + 1, a2, paredge[c * 2 + 2]);

	drawRecursive(c*2+1, cdep + 1, a1);
	drawRecursive(c*2+2, cdep + 1, a2);

}

// build the segment tree, based on the current array size.
function buildSegmentTree() {

	bstart = 1;
	maxDepth = 0;
	while (bstart < arrSize) {
		bstart *= 2;
		maxDepth += 1;
	}
	stsize = bstart * 2 - 1;
	bstart -= 1;

	datums = [];
	paredge = [];
	vis().innerHTML = "";

	for (var i = 0; i < stsize; i++) {
		datums.push(0);
		paredge.push(i);
	}

	drawRecursive(0, 0, 0);

}



// marks a node, appends the mark to the marks array
function mark(ind, domark = true, whatColor = markColor) {

	var outline = document.getElementById(outlineIDPrefix + ind);
	if (domark == true) {
		outline.setAttribute('fill', whatColor);
		outline.setAttribute('stroke-width', markWidth);
		marks.push(ind);
	}
	else {
		outline.setAttribute('fill', nodeColor);
		outline.setAttribute('stroke-width', nodeBorderWidth);
	}

}

// sets the value at index ind to v
function set(ind, v) {

	datums[ind] = v;
	var text = document.getElementById(textIDPrefix + ind);
	text.innerHTML = v;

}

function upd(ind, toAdd) {
	for (var i = 0; i < marks.length; i++) {
		mark(marks[i], false);
	}
	marks = [];

	var cind = ind + bstart;
	while (cind >= 0) {
		mark(cind);
		set(cind, datums[cind] + toAdd);
		if (cind == 0) break;
		cind = Math.floor((cind - 1) / 2);
		
	}

}

function tellUser(message) {
	document.getElementById(whereToWrite).innerHTML = message;
}

function updateOperation() {
	
	tellUser("");
	var val = parseInt(document.getElementById(valInputID).value);
	var ind = parseInt(document.getElementById(indInputID).value);
	
	if (isNaN(val) || isNaN(ind)) return;
	if (ind >= arrSize || ind < 0) {
		tellUser(outOfBounds);
		return;
	}
	upd(ind, val);

}

function markRecursive(c) {
	mark(c);
	if (c >= bstart) return;
	markRecursive(c * 2 + 1);
	markRecursive(c * 2 + 2);
}

function queryRecursive(c, cmin, cmax, minb, maxb) {

	if (cmin >= minb && cmax <= maxb) {
		mark(c, true, queryMark);
		if (c < bstart) {
			markRecursive(c*2+1);
			markRecursive(c*2+2);
		}
		return datums[c];
	}

	if (cmin > maxb || cmax < minb) return 0;

	return queryRecursive(c*2+1, cmin, Math.floor((cmin+cmax)/2), minb, maxb) +
		   queryRecursive(c*2+2, 1+Math.floor((cmin+cmax)/2), cmax, minb, maxb);

}

function queryOperation() {

	var l = parseInt(document.getElementById(lInputID).value);
	var r = parseInt(document.getElementById(rInputID).value);
	
	if (isNaN(l) || isNaN(r)) return;
	if (l >= arrSize || r >= arrSize || l < 0 || r < 0) {
		tellUser(outOfBounds);
		return;
	}

	if (l > r) {
		tellUser("Left index should be less than right index.");
		return;
	}

	for (var i = 0; i < marks.length; i++) {
		mark(marks[i], false);
	}
	marks = [];

	var res = queryRecursive(0, 0, bstart, l, r);

	tellUser("Result of query is: " + res);

}

function setHTMLToAboutSegtree() {
	var tw = document.getElementById(whereToWrite);
	tw.innerHTML = "";

	document.getElementById(controlID).innerHTML = "";

	var purpose = document.createElement("p");
	purpose.innerHTML = 
	"Segment trees can be used for quickly modifying and querying an array: "+
	"examples would be adding x to the value at index i, or querying the sum "+
	"of the values between indices l and r. Doing this naively would take linear " +
	"time for each query, but with segment trees, both operations take lg(N) time.";
	
	tw.appendChild(purpose);

	var aboutVis = document.createElement("p");
	aboutVis.innerHTML =
	"This visualization supports point add and range sum query operations. " +
	"However, this basic segment tree can be modified to support other operations: " +
	"for instance, point add/range min, point set/range sum, and point add/range gcd, just to name a few.";

	tw.appendChild(aboutVis);

}

function setHTMLToUpdate() {
	
	var cp = document.getElementById(controlID);
	cp.innerHTML = "";
	var txt = document.getElementById(whereToWrite);
	txt.innerHTML = "";

	// <input type="number" id="valueInput" placeholder="Value to add">
	// <input type="number" id="indexInput" placeholder="Index to add to">
	// <button onclick="updateOperation()">Go</button>

	var cdiv = document.createElement("div");

	var valv = document.createElement("input");
	valv.setAttribute("type", "number");
	valv.setAttribute("id", valInputID);
	valv.setAttribute("placeholder", "Value to add");

	cdiv.appendChild(valv);

	var indv = document.createElement("input");
	indv.setAttribute("type", "number");
	indv.setAttribute("id", indInputID);
	indv.setAttribute("placeholder", "Index to add to");

	cdiv.appendChild(indv);

	var button = document.createElement("button");
	button.setAttribute("onclick", "updateOperation()");
	button.innerHTML = "Go";

	cdiv.appendChild(button);

	cp.appendChild(cdiv);

}

function setHTMLToQuery() {
	
	var cp = document.getElementById(controlID);
	cp.innerHTML = "";
	var txt = document.getElementById(whereToWrite);
	txt.innerHTML = "";

	var cdiv = document.createElement("div");

	var valv = document.createElement("input");
	valv.setAttribute("type", "number");
	valv.setAttribute("id", lInputID);
	valv.setAttribute("placeholder", "Left bound of query");

	cdiv.appendChild(valv);

	var indv = document.createElement("input");
	indv.setAttribute("type", "number");
	indv.setAttribute("id", rInputID);
	indv.setAttribute("placeholder", "Right bound of query");

	cdiv.appendChild(indv);

	var button = document.createElement("button");
	button.setAttribute("onclick", "queryOperation()");
	button.innerHTML = "Go";

	cdiv.appendChild(button);

	cp.appendChild(cdiv);

}

function switchStuff() {
	var chosen = document.getElementById(selectionBar).value;
	if (chosen == updateOption) setHTMLToUpdate();
	if (chosen == aboutOption) setHTMLToAboutSegtree();
	if (chosen == queryOption) setHTMLToQuery();

}


function initall() {
	buildSegmentTree();
	switchStuff();
}

