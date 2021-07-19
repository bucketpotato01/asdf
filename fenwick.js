
var nodeColor = '#ffffff';   // color to fill the nodes with
var nodeBorder = '#000000';  // color of the borders of the nodes
var nodeBorderWidth = 1;   // name is self-explanatory
var nodeSize = 8;         // radius of the nodes on the svg
var markColor = '#ffd7d4'  // the color for marking nodes
var markWidth = 2;         // radius of marked nodes' borders
var queryMark = '#ffa6a6'  // color of marked queried nodes

var textOffset = nodeSize / 2;  // make the nodes pretty
var textSize = 'x-small'        // size of the text in the nodes

// helpful for working with IDs in the html file
const nodeIdPrefix = "stVisNode";  // prefix for the ID of a node on the svg
const textIDPrefix = "stText"      // prefix for the ID of text
const edgeIDPrefix = "stEdge";     // prefix for ID of an edge
const outlineIDPrefix = "outline"; // prefix for ID of a outline
const bitVisID = "bitvis";          // ID of the svg
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

class Fenwick {

	constructor(id) {

		this.id = id;
		this.arrSize = 63;

		this.datums = [];
		this.paredge = [];
		this.marks = [];
		this.vis().innerHTML = "";

		for (var i = 0; i <= this.arrSize; i++) {
			this.datums.push(0);
			this.paredge.push(i);
		}

		this.canvasWidth = this.vis().width.animVal.value;
		this.canvasHeight = this.vis().height.animVal.value;

		this.numBits = 0;
		var pow2 = 1;
		while (pow2 <= this.arrSize) {
			pow2 *= 2;
			this.numBits++;
		}
		this.numBits--;

		this.horizSplit = this.numBits + 2;
		this.horizSize = this.canvasWidth / this.horizSplit;

		this.vertSplit = this.arrSize + 3;
		this.vertSize = this.canvasHeight / this.vertSplit;

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

	walkTo(x1, y1, x2, y2, dToWalk) {
		var coords = [x1, y1];
		var goal = [x2, y2];
		var tdist = ((goal[1] - coords[1])**2 + (goal[0] - coords[0])**2) ** 0.5;
		var xratio = (goal[0] - coords[0]) / tdist;
		var cdx = xratio * dToWalk;
		var yratio = (goal[1] - coords[1]) / tdist;
		var cdy = yratio * dToWalk;
		return [coords[0] + cdx, coords[1] + cdy];
	}

	makeLine(x1, y1, x2, y2, id) {
		var par = this.walkTo(x1, y1, x2, y2, nodeSize);
		var cur = this.walkTo(x2, y2, x1, y1, nodeSize);
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

	getCoords(x) {

		if (x == 0) {
			return [this.canvasWidth - this.horizSize, this.canvasHeight - this.vertSize];
		}

		var lowestSetBit = 0;
		if (x == 0) {
			lowestSetBit = 0;
		}
		else {
			for (var i = 1; true; i++) {
				if (x % (1 << i) != 0) {
					lowestSetBit = i - 1;
					break;
				}
			}
		}

		return [this.horizSize * (lowestSetBit + 1), this.canvasHeight - this.vertSize * (x + 1)];

	}

	upd(ind, toAdd) {

		this.unmarkall();
		while (ind <= this.arrSize) {
			this.set(ind, this.datums[ind] + toAdd);
			this.mark(ind);
			ind += (ind & (-ind));
		}

	}

	query(ind) {
		
		this.unmarkall();
		var ans = 0;
		while (ind > 0) {
			this.mark(ind);
			ans += this.datums[ind];
			ind -= (ind & (-ind));
		}
		return ans;

	}

	draw() {

		for (var i = 1; i <= this.arrSize; i++) {
			var c1 = this.getCoords(i);
			var c2 = this.getCoords(i - (i & (-i)));
			this.makeLine(c1[0], c1[1], c2[0], c2[1], i);
		}

		for (var i = 0; i <= this.arrSize; i++) {
			var currCoords = this.getCoords(i);
			this.createNode(currCoords[0], currCoords[1], this.datums[i], i);
		}

	}

	redraw() {
		this.vis().innerHTML = "";
		this.draw();
	}
}


class UserInteraction {

	constructor(ms) {
		this.bit = ms;
	}

	tellUser(message) {
		document.getElementById(whereToWrite).innerHTML = message;
	}

	updateOperation() {
		
		this.tellUser("");
		var val = parseInt(document.getElementById(valInputID).value);
		var ind = parseInt(document.getElementById(indInputID).value);
		
		if (isNaN(val) || isNaN(ind)) return;
		if (ind > this.bit.arrSize || ind <= 0) {
			this.tellUser("Index out of bounds");
			return;
		}
		this.bit.upd(ind, val);

	}

	queryOperation() {

		var l = parseInt(document.getElementById(indInputID).value);
		
		if (isNaN(l)) return;
		if (l > this.bit.arrSize || l <= 0) {
			this.tellUser("Index out of bounds");
			return;
		}

		var res = this.bit.query(l);

		this.tellUser("Result of query is: " + res);

	}

	resetAll() {
		var cp = document.getElementById(controlID);
		cp.innerHTML = "";
		var txt = document.getElementById(whereToWrite);
		txt.innerHTML = "";
	}

	setHTMLToAbout() {
		
		this.resetAll();

		var tw = document.getElementById(whereToWrite);

		document.getElementById(controlID).innerHTML = "";

		var purpose = document.createElement("p");
		purpose.innerHTML = 
		"Fenwick trees can be used for quickly modifying and querying an array in lg(N) time per operation.";
		
		tw.appendChild(purpose);

		var aboutVis = document.createElement("p");
		aboutVis.innerHTML =
		"About this visualization: when updating, the nodes that are changed will be highlighted. When querying, the datums that are added to the total are highlighted in a darker color.";

		tw.appendChild(aboutVis);

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
		valv.setAttribute("id", indInputID);
		valv.setAttribute("placeholder", "Upper bound of query");

		cdiv.appendChild(valv);

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
		
		this.bit.redraw();

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
	if (chosen == aboutOption) interaction.setHTMLToAbout();
	if (chosen == queryOption) interaction.setHTMLToQuery();
	if (chosen == settingsOption) interaction.setHTMLToSettings();
}

function initall() {

	interaction = new UserInteraction( new Fenwick(bitVisID) );
	switchStuff();

}