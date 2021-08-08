
var nodeColor = '#ffffff';   // color to fill the nodes with
var nodeBorder = '#000000';  // color of the borders of the nodes
var nodeBorderWidth = 1;   // name is self-explanatory
var nodeSize = 8;         // radius of the nodes on the svg
var markColor = '#ffd7d4'  // the color for marking nodes
var markWidth = 2;         // radius of marked nodes' borders

var textSize = 10               // size of the text in the nodes
var textOffset = textSize / 3;  // make the nodes pretty

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

const infoIDPrefix = "onclickInfo";
const popupTextSize = 'x-small';
var popupWidth = 150;
var popupHeight = 30;
var popupFill = '#e6e6e6';
var popupBorder = '#000000';
const popupBorderWidth = 1;

const aboutText = `You are given an array, and you should be able to modify elements and find the sum of a range in the array. Fenwick trees, or Binary Indexed trees (BIT) accomplish this in logarithmic time per operation.
Update operations: there is at most one node of each size that covers any one index. Iterating through and changing these nodes takes lg(N) time.
Query operations: Traversing the tree rightwards until the zero node will go through at most lg(N) nodes.`;

const bitotheruses = `Each index is assigned a range to cover based on its lowest set bit: for example, the lowest set bit of 22 (10110 in binary) would be 2 (00010 in binary), so index 22 would cover a range of size 2.`;

function addlabel(svgid, x, y, whatToWrite, nodeInd) {

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

class AboutFenwick {

	constructor(ts) {
		this.ts = ts;

		this.addAbout();
		this.addAboutUpdate();
		this.addAboutQuery();

		ts.innerHTML += "";

	}

	addDivider() {
		var ts = this.ts;
		var chr = document.createElement("hr");
		ts.appendChild(chr);
	}

	addText(where, what) {

		var newp = document.createElement("p");
		newp.innerHTML = what;
		document.getElementById(where).appendChild(newp);

	}

	makeSpoiler(sptxt, tospoiler) {
		var res = document.createElement("b");
		res.innerHTML = sptxt;

		var v1 = "";
		var v2 = "";
		for (var j = 0; j < tospoiler.length; j++) {
			var i = tospoiler[j];
			v1 = v1 + `document.getElementById('${i}').style.display = '';`;
			v2 = v2 + `document.getElementById('${i}').style.display = 'none';`;
		}
		var finif = `if (document.getElementById('${tospoiler[0]}').style.display == 'none') {${v1}} else {${v2}}`;

		res.setAttribute("onclick", finif);
		var fr = document.createElement("p");
		fr.appendChild(res);
		return fr;

	}

	hiddenText(ttxt, tid) {
		var res = document.createElement("p");
		res.setAttribute("id", tid);
		res.setAttribute("style", "display: none;");
		res.innerHTML = ttxt;
		return res;
	}

	addAbout() {

		var ts = this.ts;
		var texttowrite = aboutText.split("\n");

		this.addText(whereToWrite, texttowrite[0]);

		var bt = this.makeSpoiler("How does the BIT do this?", ["moreaboutbitusage"]);
		var moreinfo = this.hiddenText(bitotheruses, "moreaboutbitusage");
		
		ts.appendChild(bt);
		ts.appendChild(moreinfo);


		this.addDivider();

	}

	addAboutUpdate() {

		var ts = this.ts;
		var texttowrite = aboutText.split("\n");

		this.addText(whereToWrite, texttowrite[1]);
		ts.innerHTML += "<div class='maindiv'><svg id=uexsvg width='512' height='512'></svg></div>";
		var uexst = new Fenwick("uexsvg", 63);
		uexst.upd(17, 1);


		this.addDivider();

	}

	addAboutQuery() {

		var ts = this.ts;
		var texttowrite = aboutText.split("\n");

		this.addText(whereToWrite, texttowrite[2]);
		ts.innerHTML += "<div class='maindiv'><svg id=qexsvg width='512' height='512'></svg></div>";
		var qexst = new Fenwick("qexsvg", 63);
		qexst.query(55);


		this.addDivider();

	}

}

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

		// console.log(infoText);

		if (currID == 0)
			infoText = "Not actually used";

		displayNode.setAttribute('onclick', 
			'addlabel(' + 
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

	addText(where, what) {

		var newp = document.createElement("p");
		newp.innerHTML = what;
		document.getElementById(where).appendChild(newp);

	}

	setHTMLToAbout() {
		
		this.resetAll();
		document.getElementById(controlID).innerHTML = "";

		var ts = document.getElementById(whereToWrite);

		var helper = new AboutFenwick(ts);

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

	checkIfValid(v, ov) {
		if (isNaN(parseInt(v))) return ov;
		return parseInt(v);
	}

	setoptions() {

		var coloroptions = [
			["Node Fill", nodeColor],
			["Node Border", nodeBorder],
			["Mark Color 1", markColor],
			["Popup Fill", popupFill],
			["Popup Border", popupBorder]
		]
			
		nodeColor = document.getElementById(coloroptions[0][0]).value;
		nodeBorder = document.getElementById(coloroptions[1][0]).value;
		markColor = document.getElementById(coloroptions[2][0]).value;
		popupFill = document.getElementById(coloroptions[3][0]).value;
		popupBorder = document.getElementById(coloroptions[4][0]).value;

		var cosmeticOptions = [
			 ["Node Size", nodeSize]
			,["Node Border Width", nodeBorderWidth]
			,["Popup Width", popupWidth]
			,["Popup Height", popupHeight]
			,["Text Size", textSize]
		];

		nodeSize = this.checkIfValid(document.getElementById(cosmeticOptions[0][0]).value, nodeSize);
		nodeBorderWidth = this.checkIfValid(document.getElementById(cosmeticOptions[1][0]).value, nodeBorderWidth);
		popupWidth = this.checkIfValid(document.getElementById(cosmeticOptions[2][0]).value, popupWidth);
		popupHeight = this.checkIfValid(document.getElementById(cosmeticOptions[3][0]).value, popupHeight);
		textSize = this.checkIfValid(document.getElementById(cosmeticOptions[4][0]).value, textSize);
		textOffset = textSize / 3;
		
		this.bit.redraw();

	}

	setHTMLToSettings() {

		this.resetAll();

		var cp = document.getElementById(controlID);
		// cp.setAttribute("class", "maindiv");

		var dcolors = document.createElement("div");
		dcolors.setAttribute("class", "uidiv");

		var coloroptions = [
			 ["Node Fill", nodeColor]
			,["Node Border", nodeBorder]
			,["Mark Color 1", markColor]
			,["Popup Fill", popupFill]
			,["Popup Border", popupBorder]
		]

		for (var i = 0; i < coloroptions.length; i++) {
			var tdiv = document.createElement("div");
			tdiv.setAttribute("class", "regdiv");
			var wone = document.createElement("label");
			wone.innerHTML = coloroptions[i][0];
			var cin = document.createElement("input");
			cin.setAttribute("type", "color");
			cin.setAttribute("value", coloroptions[i][1]);
			cin.setAttribute("placeholder", coloroptions[i][0]);
			cin.setAttribute("id", coloroptions[i][0]);
			cin.setAttribute("class", "smallinput");
			tdiv.appendChild(wone);
			tdiv.appendChild(cin);
			dcolors.appendChild(tdiv);
		}

		var dcosmetic = document.createElement("div");
		dcosmetic.setAttribute("class", "uidiv");

		var cosmeticOptions = [
			 ["Node Size", nodeSize]
			,["Node Border Width", nodeBorderWidth]
			,["Popup Width", popupWidth]
			,["Popup Height", popupHeight]
			,["Text Size", textSize]
		];

		for (var i = 0; i < cosmeticOptions.length; i++) {
			var tdiv = document.createElement("div");
			tdiv.setAttribute("class", "regdiv");
			var wone = document.createElement("label");
			wone.innerHTML = cosmeticOptions[i][0];
			var cin = document.createElement("input");
			cin.setAttribute("type", "number");
			cin.setAttribute("value", cosmeticOptions[i][1]);
			cin.setAttribute("placeholder", cosmeticOptions[i][0]);
			cin.setAttribute("id", cosmeticOptions[i][0]);
			cin.setAttribute("class", "smallinput");
			tdiv.appendChild(wone);
			tdiv.appendChild(cin);
			dcosmetic.appendChild(tdiv);
		}

		var odiv = document.createElement("div");

		var butt = document.createElement("button");
		butt.innerHTML = "Save";
		butt.setAttribute("onclick", "interaction.setoptions()");
		odiv.appendChild(butt);

		cp.appendChild(dcolors);
		cp.appendChild(dcosmetic);
		cp.appendChild(odiv);

		cp.innerHTML += "";
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