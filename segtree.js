
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

class Segtree {

	constructor(id) {

		this.id = id;
		this.arrSize = 16;

		this.bstart = 1;
		this.maxDepth = 0;
		while (this.bstart < this.arrSize) {
			this.bstart *= 2;
			this.maxDepth += 1;
		}
		this.stsize = this.bstart * 2 - 1;
		this.bstart -= 1;

		this.datums = [];
		this.paredge = [];
		this.marks = [];
		this.vis().innerHTML = "";

		for (var i = 0; i < this.stsize; i++) {
			this.datums.push(0);
			this.paredge.push(i);
		}

		this.drawRecursive(0, 0, 0);

	}

	vis() { return document.getElementById(this.id); }

	createNode(x, y, val, currID) {

		var displayNode = document.createElement('g');

		var circle = document.createElement('circle');
		circle.setAttribute('cx', x);
		circle.setAttribute('cy', y);
		circle.setAttribute('r', nodeSize);
		circle.setAttribute('stroke', nodeBorder);
		circle.setAttribute('stroke-width', nodeBorderWidth);
		circle.setAttribute('fill', nodeColor);
		circle.setAttribute('id', this.id + outlineIDPrefix + currID);
		displayNode.appendChild(circle);

		var temp = document.createElement('text');
		temp.setAttribute('x', x);
		temp.setAttribute('y', y + textOffset);
		temp.setAttribute('text-anchor', 'middle');
		temp.setAttribute('font-size', textSize);
		temp.setAttribute('id', this.id + textIDPrefix + currID);
		temp.innerHTML = val;
		displayNode.appendChild(temp);

		displayNode.setAttribute('id', this.id + nodeIdPrefix + currID);

		this.vis().appendChild(displayNode);
		this.vis().innerHTML += "";

	}

	getCoords(dep, which) {

		var numnodes = 2 ** dep;

		var canvasWidth = this.vis().width.animVal.value;
		var canvasHeight = this.vis().height.animVal.value;

		var nv = numnodes + 1;
		var x = (canvasWidth / nv) * (which + 1);
		var y = (canvasHeight / (this.maxDepth + 2)) * (dep + 1);

		return [x, y];

	}

	walkTo(coords, goal, dToWalk) {
		var tdist = ((goal[1] - coords[1])**2 + (goal[0] - coords[0])**2) ** 0.5;
		var xratio = (goal[0] - coords[0]) / tdist;
		var cdx = xratio * dToWalk;
		var yratio = (goal[1] - coords[1]) / tdist;
		var cdy = yratio * dToWalk;
		return [coords[0] + cdx, coords[1] + cdy];
	}

	makeLine(pd, pa, cd, ca, id) {
		if (pd == -1 || pa == -1) return false;
		if (cd == -1 || ca == -1) return false;
		var par = this.getCoords(pd, pa);
		var cur = this.getCoords(cd, ca);

		var temp1 = this.walkTo(par, cur, nodeSize);
		var temp2 = this.walkTo(cur, par, nodeSize);

		par = temp1;
		cur = temp2;

		var cline = document.createElement('line');
		cline.setAttribute('x1', par[0]);
		cline.setAttribute('y1', par[1]);
		cline.setAttribute('x2', cur[0]);
		cline.setAttribute('y2', cur[1]);
		cline.setAttribute('id', this.id + edgeIDPrefix + id);
		cline.setAttribute('stroke-width', 1);
		cline.setAttribute('stroke', 'black');
		this.vis().appendChild(cline);
		this.vis().innerHTML += "";
		return true;
	}

	drawRecursive(c, cdep, cacross) {

		var ccoords = this.getCoords(cdep, cacross);
		this.createNode(ccoords[0], ccoords[1], this.datums[c], c);

		if (c >= this.bstart) return;

		var a1 = cacross * 2;
		var a2 = cacross * 2 + 1;

		var c1c = this.getCoords(cdep + 1, a1);
		var c2c = this.getCoords(cdep + 1, a2);

		this.makeLine(cdep, cacross, cdep + 1, a1, this.paredge[c * 2 + 1]);
		this.makeLine(cdep, cacross, cdep + 1, a2, this.paredge[c * 2 + 2]);

		this.drawRecursive(c*2+1, cdep + 1, a1);
		this.drawRecursive(c*2+2, cdep + 1, a2);

	}

	mark(ind, domark = true, whatColor = markColor) {

		var outline = document.getElementById(this.id + outlineIDPrefix + ind);
		if (domark == true) {
			outline.setAttribute('fill', whatColor);
			outline.setAttribute('stroke-width', markWidth);
			this.marks.push(ind);
		}
		else {
			outline.setAttribute('fill', nodeColor);
			outline.setAttribute('stroke-width', nodeBorderWidth);
		}

	}

	set(ind, v) {

		this.datums[ind] = v;
		var text = document.getElementById(this.id + textIDPrefix + ind);
		text.innerHTML = v;

	}

	unmarkall() {

		for (var i = 0; i < this.marks.length; i++) {
			this.mark(this.marks[i], false);
		}
		this.marks = [];

	}

	upd(ind, toAdd) {

		this.unmarkall();

		var cind = ind + this.bstart;
		while (cind >= 0) {
			this.mark(cind);
			this.set(cind, this.datums[cind] + toAdd);
			if (cind == 0) break;
			cind = Math.floor((cind - 1) / 2);
			
		}

	}

	markRecursive(c) {
		this.mark(c);
		if (c >= this.bstart) return;
		this.markRecursive(c * 2 + 1);
		this.markRecursive(c * 2 + 2);
	}

	queryRecursive(c, cmin, cmax, minb, maxb) {

		if (cmin >= minb && cmax <= maxb) {
			this.mark(c, true, queryMark);
			if (c < this.bstart) {
				this.markRecursive(c*2+1);
				this.markRecursive(c*2+2);
			}
			return this.datums[c];
		}

		if (cmin > maxb || cmax < minb) return 0;

		return this.queryRecursive(c*2+1, cmin, Math.floor((cmin+cmax)/2), minb, maxb) +
			   this.queryRecursive(c*2+2, 1+Math.floor((cmin+cmax)/2), cmax, minb, maxb);

	}

	query(lo, hi) {
		this.queryRecursive(0, 0, this.bstart, lo, hi);
	}
}

var mainSegtree;

function tellUser(message) {
	document.getElementById(whereToWrite).innerHTML = message;
}

function updateOperation() {
	
	tellUser("");
	var val = parseInt(document.getElementById(valInputID).value);
	var ind = parseInt(document.getElementById(indInputID).value);
	
	if (isNaN(val) || isNaN(ind)) return;
	if (ind >= mainSegtree.arrSize || ind < 0) {
		tellUser(outOfBounds);
		return;
	}
	mainSegtree.upd(ind, val);

}

function queryOperation() {

	var l = parseInt(document.getElementById(lInputID).value);
	var r = parseInt(document.getElementById(rInputID).value);
	
	if (isNaN(l) || isNaN(r)) return;
	if (l >= mainSegtree.arrSize || r >= mainSegtree.arrSize || l < 0 || r < 0) {
		tellUser(outOfBounds);
		return;
	}

	if (l > r) {
		tellUser("Left index should be less than right index.");
		return;
	}

	mainSegtree.unmarkall();

	var res = mainSegtree.query(l, r);

	tellUser("Result of query is: " + res);

}

function setHTMLToAboutSegtree() {
	var tw = document.getElementById(whereToWrite);
	tw.innerHTML = "";

	document.getElementById(controlID).innerHTML = "";

	var purpose = document.createElement("p");
	purpose.innerHTML = 
	"Segment trees can be used for quickly modifying and querying an array in lg(N) time per operation.";
	
	tw.appendChild(purpose);

	var aboutVis = document.createElement("p");
	aboutVis.innerHTML =
	"About this visualization: when updating, the nodes that are changed will be highlighted. When querying, the datums that are added to the total are highlighted in a darker color.";

	tw.appendChild(aboutVis);

}

function setHTMLToUpdate() {
	
	var cp = document.getElementById(controlID);
	cp.innerHTML = "";
	var txt = document.getElementById(whereToWrite);
	txt.innerHTML = "";

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

	switchStuff();
	mainSegtree = new Segtree(stVisID);


}



