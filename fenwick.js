
var nodeColor = '#ffffff';   // color to fill the nodes with
var nodeBorder = '#000000';  // color of the borders of the nodes
var nodeBorderWidth = 1;   // name is self-explanatory
var nodeSize = 8;         // radius of the nodes on the svg
var markColor = '#ffd7d4'  // the color for marking nodes
var markWidth = 2;         // radius of marked nodes' borders
var queryMark = '#ffa6a6';

var textSize = 10               // size of the text in the nodes
var textOffset = textSize / 3;  // make the nodes pretty

// helpful for working with IDs in the html file
const nodeIdPrefix = "stVisNode";  // prefix for the ID of a node on the svg
const textIDPrefix = "stText"      // prefix for the ID of text
const edgeIDPrefix = "stEdge";     // prefix for ID of an edge
const outlineIDPrefix = "outline"; // prefix for ID of a outline
const bitVisID = "bitvis";          // ID of the svg
const valInputID = "valueInput";   // ID of the value input
const indInputIDQ = "indexInputq";
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

const infoIDPrefix = "onclickInfo";
const popupTextSize = 'x-small';
var popupWidth = 150;
var popupHeight = 30;
var popupFill = '#e6e6e6';
var popupBorder = '#000000';
const popupBorderWidth = 1;


class Fenwick {

	constructor(id, sz = 31) {

		this.id = id;
		this.arrSize = sz;

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

	toBinaryString(num) {
		var res = "";
		while (num > 0) {
			res = (num % 2) + res;
			num = Math.floor(num / 2);
		}
		return res;
	}

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

		var infoText = "Covers [" + (currID - (currID & (-currID)) + 1) + ", " + currID + "]";
		infoText = this.toBinaryString(currID) + ": " + infoText;

		if (currID == 0)
			infoText = "Not actually used";

		displayNode.setAttribute('onclick', 
			'Fenwick.addlabel(' + 
			('"' + this.id + '"') + ',' 
			+ x + ',' 
			+ y + ',' 
			+ '"' + infoText + '"' + ',' 
			+ currID + ')');

		displayNode.setAttribute('class', 'visnode');

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
		this.mark(0);
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
			this.createNode(currCoords[0], currCoords[1], (i == 0) ? "" : this.datums[i], i);
		}

	}

	redraw() {
		this.vis().innerHTML = "";
		this.draw();
	}

	static addlabel(svgid, x, y, whatToWrite, nodeInd) {

		if (document.getElementById(infoIDPrefix + svgid) != null) {
			var cind = document.getElementById(infoIDPrefix + svgid).getAttribute('ind');
			document.getElementById(infoIDPrefix + svgid).remove();
			if (cind == nodeInd) return;
		}

		var popup = document.createElement('g');
		popup.setAttribute('id', infoIDPrefix + svgid);
		popup.setAttribute('ind', nodeInd);

		var curroffset = 0;
		if (x + popupWidth > document.getElementById(svgid).width.animVal.value)
			curroffset = -popupWidth;
		
		var bg = document.createElement('rect');
		bg.setAttribute('x', x + curroffset);
		bg.setAttribute('y', y - popupHeight);
		bg.setAttribute('width', popupWidth);
		bg.setAttribute('height', popupHeight);
		bg.setAttribute('align', 'bottom');

		bg.setAttribute('fill', popupFill);
		bg.setAttribute('stroke', popupBorder);
		bg.setAttribute('stroke-width', popupBorderWidth);

		popup.appendChild(bg);

		var s = document.createElement('text');

		s.setAttribute('x', x + popupWidth / 2 + curroffset);
		s.setAttribute('y', y - popupHeight / 2.5);
		s.setAttribute('text-anchor', 'middle');
		s.setAttribute('font-size', popupTextSize);

		s.innerHTML = whatToWrite;

		popup.appendChild(s);

		document.getElementById(svgid).appendChild(popup);

		document.getElementById(svgid).innerHTML += '';

	}

}


class UserInteraction {

	static fenwick;

	static tellUser(message) {
		document.getElementById(whereToWrite).innerHTML = message;
	}

	static updateOperation() {
		
		UserInteraction.tellUser("");
		var val = parseInt(document.getElementById(valInputID).value);
		var ind = parseInt(document.getElementById(indInputIDQ).value);
		
		if (isNaN(val) || isNaN(ind)) return;
		if (ind >= UserInteraction.fenwick.arrSize || ind < 0) {
			UserInteraction.tellUser("Index out of bounds");
			return;
		}
		UserInteraction.fenwick.upd(ind, val);

	}

	static queryOperation() {

		var l = parseInt(document.getElementById(indInputID).value);
		
		if (isNaN(l)) return;
		if (l > UserInteraction.fenwick.arrSize || l <= 0) {
			UserInteraction.tellUser("Index out of bounds");
			return;
		}

		var res = UserInteraction.fenwick.query(l);

		UserInteraction.tellUser("Result of query is: " + res);

	}

	static addText(where, what) {

		var newp = document.createElement("p");
		newp.innerHTML = what;
		document.getElementById(where).appendChild(newp);

	}

	static checkIfValid(v, ov) {
		if (isNaN(parseInt(v))) return ov;
		return parseInt(v);
	}

	static updopsteps(numSteps, indToUpd, valToAdd) {
		this.uexst = new Fenwick("uexsvg", 31)
		this.uexst.unmarkall();
		for (var i = 0; i < this.uexst.stsize; i++)
			this.uexst.set(i, 0);

		var pv = -1;

		for (var i = 0; i < numSteps; i++) {
			if (indToUpd < this.uexst.arrSize) {
				this.uexst.set(indToUpd, valToAdd);
				this.uexst.mark(indToUpd, true, queryMark);
			}
			pv = indToUpd;
			indToUpd = (indToUpd) + (indToUpd & (-indToUpd));
		}

		if (indToUpd >= this.uexst.arrSize) {
			document.getElementById('updinfotxt').innerHTML = `Now on node with index ${indToUpd}, finished.`;
		}
		else {
			this.uexst.mark(indToUpd);
			document.getElementById('updinfotxt').innerHTML = `Just updated node with index ${pv}, now at node with index (${pv} + ${(pv & (-pv))}) = ${indToUpd}.`;
		}


	}

}

class Resizer {

	// https://htmldom.dev/create-resizable-split-views/

	static x;
	static y;
	static lwidth;
	static fv;

	static c;
	static l;
	static r;

	static resize(e) {

		var dx = e.clientX - Resizer.x;
		var dy = e.clientY - Resizer.y;

		var nlw = (Resizer.lwidth + dx) * 100 / Resizer.c.parentNode.getBoundingClientRect().width;
		Resizer.l.style.width = `${nlw}%`;

	}

	static stopresize(e) {

		Resizer.l.style.removeProperty('user-select');
		Resizer.l.style.removeProperty('pointer-events');
		Resizer.r.style.removeProperty('user-select');
		Resizer.r.style.removeProperty('pointer-events');

		document.removeEventListener('mousemove', Resizer.resize);
		document.removeEventListener('mouseup', Resizer.stopresize);
	}

	static sclick(e) {

		Resizer.x = e.clientX;
		Resizer.y = e.clientY;
		Resizer.lwidth = Resizer.l.getBoundingClientRect().width;

		Resizer.l.style.userSelect = 'none';
		Resizer.l.style.pointerEvents = 'none';
		Resizer.r.style.userSelect = 'none';
		Resizer.r.style.pointerEvents = 'none';
	

		document.addEventListener('mouseup', Resizer.stopresize);
		document.addEventListener('mousemove', Resizer.resize);

	}

	static sresize() {

		Resizer.c = document.getElementById('resizer');
		Resizer.l = Resizer.c.previousElementSibling;
		Resizer.r = Resizer.c.nextElementSibling;

		Resizer.lwidth = Resizer.l.getBoundingClientRect().width;
		document.getElementById('resizer').addEventListener("mousedown", Resizer.sclick);
	}
}

var interaction;
var helpabout;

function initall() {

	UserInteraction.fenwick = new Fenwick(bitVisID);

	Resizer.sresize();

	var uexst = new Fenwick("uexsvg", 31);
	var qexst = new Fenwick("qexsvg", 15);
	qexst.query(7);

}
