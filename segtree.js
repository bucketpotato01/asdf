
var nodeColor = '#ffffff';   // color to fill the nodes with
var nodeBorder = '#000000';  // color of the borders of the nodes
var nodeBorderWidth = 1;   // name is self-explanatory
var nodeSize = 15;         // radius of the nodes on the svg
var markColor = '#ffd7d4'  // the color for marking nodes
var markWidth = 2;         // radius of marked nodes' borders
var queryMark = '#ffa6a6'  // color of marked queried nodes

var textOffset = nodeSize / 4;  // make the nodes pretty
var textSize = 'x-small'        // size of the text in the nodes

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
const settingsOption = "settings";

const aboutText = `You are given an array, and you should be able to modify elements and find the sum of a range in the array. Segment trees accomplish this in logarithmic time per operation by breaking the array into segments of size 1, 2, 4, 8, etc.
Update operations: there are at most lg(N) nodes that cover one index. Traversing the tree from the element at the bottom  up to the top and updating each node along the way will be enough to update.
Query operations: because of the way the tree is organized, each range is split into at most 2 segments of each length, so at most 2 * lg(N) nodes are queried.
About the visualization: for update operations, the nodes that are modified at each step are highlighted. For query operations, all nodes in the range queried are highlighted, but only the nodes that are added to the total are highlighted a darker color.`;

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

		this.redraw();

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

		console.log(this.vis());

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

	redraw() {
		this.vis().innerHTML = "";
		this.drawRecursive(0, 0, 0);
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
		return this.queryRecursive(0, 0, this.bstart, lo, hi);
	}
}


class UserInteraction {

	constructor(ms) {
		this.segtree = ms;
	}

	tellUser(message) {
		document.getElementById(whereToWrite).innerHTML = message;
	}

	updateOperation() {
		
		this.tellUser("");
		var val = parseInt(document.getElementById(valInputID).value);
		var ind = parseInt(document.getElementById(indInputID).value);
		
		if (isNaN(val) || isNaN(ind)) return;
		if (ind >= this.segtree.arrSize || ind < 0) {
			this.tellUser("Index out of bounds");
			return;
		}
		this.segtree.upd(ind, val);

	}

	queryOperation() {

		var l = parseInt(document.getElementById(lInputID).value);
		var r = parseInt(document.getElementById(rInputID).value);
		
		if (isNaN(l) || isNaN(r)) return;
		if (l >= this.segtree.arrSize || r >= this.segtree.arrSize || l < 0 || r < 0) {
			this.tellUser("Index out of bounds");
			return;
		}

		if (l > r) {
			this.tellUser("Left index should be less than right index.");
			return;
		}

		this.segtree.unmarkall();

		var res = this.segtree.query(l, r);

		this.tellUser("Result of query is: " + res);

	}

	resetAll() {
		var cp = document.getElementById(controlID);
		cp.innerHTML = "";
		var txt = document.getElementById(whereToWrite);
		txt.innerHTML = "";
	}

	addText(where, what) {

		var newp = document.createElement("p");
		newp.innerHTML = what;
		document.getElementById(where).appendChild(newp);

	}

	setHTMLToAboutSegtree() {
		
		this.resetAll();

		var ts = document.getElementById(whereToWrite);
		document.getElementById(controlID).innerHTML = "";

		var texttowrite = aboutText.split("\n");

		this.addText(whereToWrite, texttowrite[0]);
		this.addText(whereToWrite, texttowrite[1]);

		ts.innerHTML += "<div class='maindiv'><svg id=uexsvg width='512' height='512'></svg></div>";
		var uexst = new Segtree("uexsvg");
		uexst.upd(3, 0);

		this.addText(whereToWrite, texttowrite[2]);

		ts.innerHTML += "<div class='maindiv'><svg id=qexsvg width='512' height='512'></svg></div>";
		var uexst = new Segtree("qexsvg");
		uexst.query(1, 14);

		this.addText(whereToWrite, texttowrite[3]);

	}

	setHTMLToUpdate() {
		
		this.resetAll();
		var cp = document.getElementById(controlID);

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
		button.setAttribute("onclick", "interaction.updateOperation()");
		button.innerHTML = "Go";

		cdiv.appendChild(button);

		cp.appendChild(cdiv);

	}

	setHTMLToQuery() {
		
		this.resetAll();
		var cp = document.getElementById(controlID);

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
		button.setAttribute("onclick", "interaction.queryOperation()");
		button.innerHTML = "Go";

		cdiv.appendChild(button);

		cp.appendChild(cdiv);

	}

	setoptions() {
		var coloroptions = [
			["Node Fill", nodeColor],
			["Node Border", nodeBorder],
			["Mark Color 1", markColor],
			["Mark Color 2", queryMark]
		]
			
		nodeColor = document.getElementById(coloroptions[0][0]).value;
		nodeBorder = document.getElementById(coloroptions[1][0]).value;
		markColor = document.getElementById(coloroptions[2][0]).value;
		queryMark = document.getElementById(coloroptions[3][0]).value;
		
		this.segtree.redraw();

	}

	setHTMLToSettings() {

		this.resetAll();

		var cp = document.getElementById(controlID);
		var dcolors = document.createElement("div");

		var coloroptions = [
			["Node Fill", nodeColor],
			["Node Border", nodeBorder],
			["Mark Color 1", markColor],
			["Mark Color 2", queryMark]
		]

		for (var i = 0; i < coloroptions.length; i++) {
			var wone = document.createElement("label");
			wone.innerHTML = coloroptions[i][0];
			var cin = document.createElement("input");
			cin.setAttribute("type", "color");
			cin.setAttribute("value", coloroptions[i][1]);
			cin.setAttribute("placeholder", coloroptions[i]);
			cin.setAttribute("id", coloroptions[i][0]);
			dcolors.appendChild(wone);
			dcolors.appendChild(cin);
		}

		var odiv = document.createElement("div");
		var butt = document.createElement("button");
		butt.innerHTML = "Save";
		butt.setAttribute("onclick", "interaction.setoptions()");
		odiv.appendChild(butt);

		cp.appendChild(dcolors);
		cp.appendChild(odiv);


	}

}



var interaction;

function switchStuff() {
	var chosen = document.getElementById(selectionBar).value;
	if (chosen == updateOption) interaction.setHTMLToUpdate();
	if (chosen == aboutOption) interaction.setHTMLToAboutSegtree();
	if (chosen == queryOption) interaction.setHTMLToQuery();
	if (chosen == settingsOption) interaction.setHTMLToSettings();
}

function initall() {

	interaction = new UserInteraction( new Segtree(stVisID) );
	switchStuff();

}



