
var nodeColor = '#ffffff';   // color to fill the nodes with
var nodeBorder = '#000000';  // color of the borders of the nodes
var nodeBorderWidth = 1;   // name is self-explanatory
var nodeSize = 15;         // radius of the nodes on the svg
var markColor = '#ffd7d4'  // the color for marking nodes
var markWidth = 2;         // radius of marked nodes' borders
var queryMark = '#ffa6a6'  // color of marked queried nodes

var textOffset = nodeSize / 4;  // make the nodes pretty
var textSize = 10               // size of the text in the nodes

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

const infoIDPrefix = "onclickInfo";
const popupTextSize = 'x-small';
var popupWidth = 100;
var popupHeight = 50;
var popupFill = '#e6e6e6';
var popupBorder = '#000000';
const popupBorderWidth = 1;

const aboutText = `You are given an array, and you should be able to modify elements and find the sum of a range in the array. Segment trees accomplish this in logarithmic time per operation by breaking the array into segments of size 1, 2, 4, 8, etc.
Update operations: there are at most lg(N) nodes that cover one index. Traversing the tree from the element at the bottom  up to the top and updating each node along the way will be enough to update.
Query operations: because of the way the tree is organized, each range is split into at most 2 segments of each length, so at most 2 * lg(N) nodes are queried.
About the visualization: for update operations, the nodes that are modified at each step are highlighted. For query operations, all nodes in the range queried are highlighted, but only the nodes that are added to the total are highlighted a darker color.`;

const moreAboutSTUses = `The segment tree can also be extended to support a wide variety of operations, such as range updates, multiple different types of update operations (add, set, multiply, all at the same time), and higher-dimensional segment trees.`;
const moreAboutSTUpdate = `To find the parent of a node with index i, take (i - 1) / 2, rounding down. Repeat until node 0 is reached. In this example, 1 is added to the node with index 3.`;
const stpsuedocode = `
// pseudocode for segment tree (add update, range sum query) implementation

build(arraySize) {

	bstart = 1
	while (bstart < arraySize) {
		bstart = bstart * 2
	}

	segtreesize = bstart * 2 - 1
	bstart = bstart - 1

	segtree = array of size segtreesize


}

queryRecursive(currInd, currLo, currHi, queryLo, queryHi) {

	if (currLo >= queryLo and currHi <= queryHi) {
		return segtree[currInd]
	}
	if (currLo > queryHi or currHi < queryLo) {
		return 0
	}

	mid = (currLo + currHi) / 2

	return queryRecursive(currInd * 2 + 1, currLo, mid, queryLo, queryHi) +
	       queryRecursive(currInd * 2 + 2, mid + 1, currHi, queryLo, queryHi);

}

query(lo, hi) {
	return queryRecursive(0, 0, bstart, queryLo, queryHi)
}

update(ind, val) {
	ind = ind + bstart
	while (ind >= 0) {
		segtree[ind] += val
		if (ind == 0) break
		ind = (ind - 1) / 2
	}
}
`

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
		this.rangel = [];
		this.ranger = [];

		for (var i = 0; i < this.stsize; i++) {
			this.rangel.push(0);
			this.ranger.push(0);
		}

		for (var i = this.stsize - 1; i >= 0; i--) {
			if (i >= this.bstart) {
				this.ranger[i] = i - this.bstart;
				this.rangel[i] = i - this.bstart;
			}
			else {
				this.rangel[i] = this.rangel[i * 2 + 1];
				this.ranger[i] = this.ranger[i * 2 + 2];
			}
		}

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

		var infoText = "Covers [" + this.rangel[currID] + ", " + this.ranger[currID] + "]";

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

class AboutSegtree {

	constructor(ts) {

		this.ts = ts;

		this.addAbout();
		
		this.addAboutUpdate();

		this.addAboutQuery();

		this.addPseudocode();
		
	}

	addText(where, what) {

		var newp = document.createElement("p");
		newp.innerHTML = what;
		document.getElementById(where).appendChild(newp);

	}

	addAbout() {

		var ts = this.ts;
		var texttowrite = aboutText.split("\n");

		this.addText(whereToWrite, texttowrite[0]);
		
		var sptxt1 = document.createElement("b");
		sptxt1.innerHTML = "What else are segment trees used for?";

		sptxt1.setAttribute("onclick", `

			if (document.getElementById('infosp1').style.display == 'none') {
				document.getElementById('infosp1').style.display = '';
			}
			else {
				document.getElementById('infosp1').style.display = 'none';
			}

			`)

		var infosp1 = document.createElement("p");
		infosp1.setAttribute("id", "infosp1");
		infosp1.setAttribute("style", "display: none;");
		infosp1.innerHTML = moreAboutSTUses;

		ts.appendChild(sptxt1);
		ts.appendChild(infosp1);

		var chr = document.createElement("hr");
		ts.appendChild(chr);

	}

	addAboutUpdate() {

		var ts = this.ts;
		var texttowrite = aboutText.split("\n");

		this.addText(whereToWrite, texttowrite[1]);

		var moreinfo2 = document.createElement("p");
		var sptxt2 = document.createElement("b");
		sptxt2.innerHTML = "How is the tree traversed?";


		sptxt2.setAttribute("onclick", `

			if (document.getElementById('updateinfovis').style.display == 'none') {
				document.getElementById('updateinfovis').style.display = '';
				document.getElementById('uexsvg').style.display = '';
				document.getElementById('updinfotxt').style.display = '';
				document.getElementById('extinf').style.display = '';
				
			}
			else {
				document.getElementById('updateinfovis').style.display = 'none';
				document.getElementById('uexsvg').style.display = 'none';
				document.getElementById('updinfotxt').style.display = 'none';
				document.getElementById('extinf').style.display = 'none';
			}

			`)

		var extinf = document.createElement("p");
		extinf.setAttribute("style", "display: none;");
		extinf.setAttribute("id", "extinf");
		extinf.innerHTML = moreAboutSTUpdate;

		var updiv = document.createElement("p");
		updiv.setAttribute("id", "updateinfovis");
		updiv.setAttribute("class", "maindiv");
		updiv.setAttribute("style", "display: none;");

		for (var i = 1; i <= 5; i++) {
			var cb = document.createElement("b");
			cb.innerHTML = "Step " + i + " ";
			cb.setAttribute("onclick", `

				AboutSegtree.updopsteps(${i}, 3, 1);

				`)
			updiv.appendChild(cb);
		}

		moreinfo2.appendChild(sptxt2);
		moreinfo2.appendChild(extinf);
		moreinfo2.appendChild(updiv);

		var updinfotxt = document.createElement("p");
		updinfotxt.setAttribute("class", "maindiv");
		updinfotxt.setAttribute("id", "updinfotxt");
		
		updinfotxt.innerHTML = "";
		moreinfo2.appendChild(updinfotxt);

		ts.appendChild(moreinfo2);

		moreinfo2.innerHTML += "<div class='maindiv'><svg id=uexsvg width='512' height='512' style='display: none;'></svg></div>";
		this.uexst = new Segtree("uexsvg");

		var chr = document.createElement("hr");
		ts.appendChild(chr);

	}

	addAboutQuery() {

		var ts = this.ts;
		var texttowrite = aboutText.split("\n");
		this.addText(whereToWrite, texttowrite[2]);

		var moreinfo3 = document.createElement("p");
		var sptxt3 = document.createElement("b");
		sptxt3.innerHTML = "Why this upper bound?";

		sptxt3.setAttribute("onclick", `

			if (document.getElementById('qexsvg').style.display == 'none') {
				document.getElementById('qexsvg').style.display = '';
				document.getElementById('queryinfotxt').style.display = '';
			}
			else {
				document.getElementById('qexsvg').style.display = 'none';
				document.getElementById('qexsvg').style.display = 'none';
				document.getElementById('queryinfotxt').style.display = 'none';
				
			}

			`)

		moreinfo3.appendChild(sptxt3);

		var queryinfotxt = document.createElement("p");
		queryinfotxt.innerHTML = "Any segment can be represented as a sequence of segments of length one. First, merge adjacent elements into segments of length two. Doing this will leave at most 2 segments of length one. Repeat the process for segments of length two (ignoring the segments of length one now), all the way up to segments of length n. This will leave at most 2 segments of each length to query.";
		queryinfotxt.setAttribute("style", "display: none;");
		queryinfotxt.setAttribute("id", "queryinfotxt");
		moreinfo3.appendChild(queryinfotxt);

		ts.appendChild(moreinfo3);

		ts.innerHTML += "<div class='maindiv'><svg id=qexsvg width='512' height='512' style='display: none;''></svg></div>";
		this.qexst = new Segtree("qexsvg");
		this.qexst.query(1, 14);

		var chr = document.createElement("hr");
		ts.appendChild(chr);

	}

	addPseudocode() {

		var ts = this.ts;

		var cspoiler = document.createElement("b");
		cspoiler.innerHTML = "Pseudocode for the segment tree";

		cspoiler.setAttribute("onclick", `

			if (document.getElementById('pseudocode').style.display == 'none') {
				document.getElementById('pseudocode').style.display = '';
				document.getElementById('pseudocodecode').style.display = '';
				document.getElementById('pseudocodepre').style.display = '';
			}
			else {
				document.getElementById('pseudocode').style.display = 'none';
				document.getElementById('pseudocodecode').style.display = 'none';
				document.getElementById('pseudocodepre').style.display = 'none';
			}

			`)

		var codep = document.createElement("p");
		var codeb = document.createElement("pre");
		var acode = document.createElement("code");
		acode.innerHTML = stpsuedocode;

		codeb.appendChild(acode);
		codep.appendChild(codeb);

		acode.setAttribute("style", "display: none;");
		acode.setAttribute("id", "pseudocode");
		codeb.setAttribute("style", "display: none;");
		codeb.setAttribute("id", "pseudocodecode");
		codep.setAttribute("style", "display: none;");
		codep.setAttribute("id", "pseudocodepre");
		
		ts.appendChild(cspoiler);
		ts.appendChild(codep);
		ts.innerHTML += "";

	}

	static updopsteps(numSteps, indToUpd, valToAdd) {
		this.uexst = new Segtree("uexsvg")
		this.uexst.unmarkall();
		for (var i = 0; i < this.uexst.stsize; i++)
			this.uexst.set(i, 0);

		var pv = -1;
		indToUpd += this.uexst.bstart;
		for (var i = 0; i < numSteps; i++) {
			this.uexst.set(indToUpd, valToAdd);
			this.uexst.mark(indToUpd, true, queryMark);
			pv = indToUpd;
			indToUpd = Math.floor((indToUpd - 1) / 2);
		}

		if (pv == 0) {
			document.getElementById('updinfotxt').innerHTML = `Just updated node with index 0, now finished.`;
		}
		else {
			this.uexst.mark(indToUpd);
			document.getElementById('updinfotxt').innerHTML = `Just updated node with index ${pv}, now at node with index (${pv} - 1) / 2 = ${indToUpd}.`;
		}


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

		this.tellUser("Result of query is " + res);

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
		document.getElementById(controlID).innerHTML = "";

		var ts = document.getElementById(whereToWrite);

		var helper = new AboutSegtree(ts);

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
		
		this.segtree.redraw();

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
	if (chosen == aboutOption) interaction.setHTMLToAboutSegtree();
	if (chosen == queryOption) interaction.setHTMLToQuery();
	if (chosen == settingsOption) interaction.setHTMLToSettings();
}

function initall() {

	interaction = new UserInteraction( new Segtree(stVisID) );
	switchStuff();

}

