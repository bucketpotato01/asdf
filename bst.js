
const nodeColor = 'white';   // color to fill the nodes with
const nodeBorder = 'black';  // color of the borders of the nodes
const nodeBorderWidth = 1;   // name is self-explanatory
const nodeSize = 8;          // radius of the nodes on the svg
const textOffset = 3;        // make the nodes pretty
const maxDepth = 5;          // the maximum depth of the binary tree - past this, nodes will go offscreen
const maxDatumValue = 99;    // maximum absolute value of values in the BST
const deltaMove = 8;         // how large should each step of the animation be? larger value -> faster animation
const unfinishedOffset = 20; // how far to offset nodes still being inserted into the BST

// helpful for working with IDs in the html file
const nodeIdPrefix = "bstVisNode"; 
const bstVisID = "bstvis";
const inputID = "valueInput";

// constants for the workings of the BST
const nullNode = -1;
const VALUE = 0; // value stored in the node
const CHILD = 1; // children of the node
const VISID = 2; // the ID of the node in the html file
const COORD = 3; // where to draw the node

var datums = []; // stores the BST
var currID = 0;  // ids to assign the nodes in the html file

var inAnim = false;   // is the animation running?
var finished = false; // is the animation finished?
var toInsert = -1;    // what is the value being inserted?
var currDatumInd = 0; // where in the BST are we right now?
var currNodeID = -1;  // what is the ID of the node being inserted?
var cdep = 0;         // what is the current depth?
var cacross = 0;      // where in this depth level is the node?
var cx, cy, gx, gy;   // helper variables for the animation


function vis() { return document.getElementById(bstVisID); }

// returns the text for a circle on the svg
function createCircle(x, y, r = nodeSize) {

	var temp = '<circle cx=' + x + 
		       ' cy=' + y + 
		       ' r=' + r + 
		       ' stroke=' + nodeBorder +
		       ' stroke-width=' + nodeBorderWidth +
		       ' fill=' + nodeColor +
		'></circle>';

	return temp;
}

function createText(x, y, textToMake) {

	var temp = '<text x=' + x + 
			   ' y=' + (y + textOffset) + 
			   ' text-anchor=middle font-size=x-small>' +
			   textToMake + '</text>';
	return temp;

}

function createNode(x, y, val) {

	var displayNode = document.createElement('g');
	displayNode.innerHTML += createCircle(x, y);
	displayNode.innerHTML += createText(x, y, val);
	displayNode.id = nodeIdPrefix + currID;

	currID += 1;

	vis().appendChild(displayNode);
	vis().innerHTML += "";

	return currID - 1;

}

function removeFromDoc(id) { document.getElementById(id).remove(); }

function getCoords(dep, which, finished = true) {

	var numnodes = 2 ** dep;

	var canvasWidth = document.getElementById(bstVisID).width.animVal.value;
	var canvasHeight = document.getElementById(bstVisID).height.animVal.value;

	var nv = numnodes + 1;
	var x = (canvasWidth / nv) * (which + 1);
	var y = (canvasHeight / (maxDepth + 2)) * (dep + 1);

	if (finished == false)
		y -= unfinishedOffset;

	return [x, y];

}

function newNode(val, id, dep, whichleft) {
	return [val,                // value stored
		    [-1, -1],           // left, right children
		    id,                 // id of the node
		    [dep, whichleft]];  // where to draw it   
}

function moveThing(id, x, y) {

	var container = document.getElementById(nodeIdPrefix + id);
	var transformNode = 'translate(' + x + ',' + y + ')';
	container.setAttribute('transform', transformNode);

}

function animateNode() {

	if (cy >= gy) {
		moveThing(currNodeID, gx, gy);
		return 1;
	}

	var xratio = (gx - cx) / (((gx-cx)**2 + (gy-cy)**2)**0.5);
	var cdx = xratio * deltaMove;
	var cdy = (deltaMove**2 - cdx**2)**0.5;

	moveThing(currNodeID, cx + cdx, cy + cdy);
	cx += cdx;
	cy += cdy;
	
	var req = window.requestAnimationFrame(animateNode);
	return 1;

}

function nextStep() {

	var foundEqual = false;

	if (currDatumInd >= datums.length) {
		datums.push(newNode(toInsert, currNodeID, cdep, cacross));
		finished = true;
	}
	else {
		var cdatum = datums[currDatumInd][VALUE];

		if (cdatum == toInsert) {
			document.getElementById(nodeIdPrefix + currNodeID).remove();
			finished = true;
			foundEqual = true;
		}
		else {
			var initLoc = getCoords(0, 0, false);
			var prevLoc = getCoords(cdep, cacross, false);

			if (toInsert < cdatum) {
				if (datums[currDatumInd][CHILD][0] == -1)
					datums[currDatumInd][CHILD][0] = datums.length;
				currDatumInd = datums[currDatumInd][CHILD][0];
				cdep += 1;
				cacross *= 2;
			}

			else {
				if (datums[currDatumInd][CHILD][1] == -1)
					datums[currDatumInd][CHILD][1] = datums.length;
				currDatumInd = datums[currDatumInd][CHILD][1];
				cdep += 1;
				cacross *= 2;
				cacross += 1;
			}

			var newLoc = getCoords(cdep, cacross, false);

			cx = prevLoc[0] - initLoc[0];
			cy = prevLoc[1] - initLoc[1];
			gx = newLoc[0] - initLoc[0];
			gy = newLoc[1] - initLoc[1];

			animateNode();

		}
	}

	if (finished) {
		inAnim = false;

		if (foundEqual == false) {
			var initLoc = getCoords(0, 0, false);
			var prevLoc = getCoords(cdep, cacross, false);
			var newLoc = getCoords(cdep, cacross, true);
			
			cx = prevLoc[0] - initLoc[0];
			cy = prevLoc[1] - initLoc[1];
			gx = newLoc[0] - initLoc[0];
			gy = newLoc[1] - initLoc[1];

			animateNode();
		}

		return false;
	}

	return true;

}

function addNode() {

	var val = document.getElementById(inputID).value;
	val = parseInt(val);

	if (isNaN(val)) return;
	if (Math.abs(val) > maxDatumValue) return;

	inAnim = true;
	finished = false;
	toInsert = val;
	currDatumInd = 0;

	cdep = 0;
	cacross = 0;

	var sv = getCoords(0, 0, false);
	currNodeID = createNode(sv[0], sv[1], val);

}

function gogo() {
	if (inAnim) nextStep();
	else addNode();
}
