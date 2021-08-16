
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
const whereToWrite2 = "outputText2";
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


class Segtree {

	constructor(id, tsize = 16) {

		this.id = id;
		this.arrSize = tsize;

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
			'Segtree.addlabel(' + 
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

class AboutSegtree {

	static aboutText = `You are given an array, and you should be able to modify elements and find the sum of a range in the array. Segment trees accomplish this in logarithmic time per operation by breaking the array into segments of size 1, 2, 4, 8, etc.
	Update operations: there are at most lg(N) nodes that cover one index. Traversing the tree from the element at the bottom  up to the top and updating each node along the way will be enough to update.
	Query operations: because of the way the tree is organized, each range is split into at most 2 segments of each length, so at most 2 * lg(N) nodes are queried.
	About the visualization: for update operations, the nodes that are modified at each step are highlighted. For query operations, all nodes in the range queried are highlighted, but only the nodes that are added to the total are highlighted a darker color.`;

	static moreAboutSTUses = `The segment tree can also be extended to support a wide variety of operations, such as range updates, multiple different types of update operations (add, set, multiply, all at the same time), and higher-dimensional segment trees.`;
	static moreAboutSTUpdate = `Start at the bottom by adding a constant to the index being added to. To find the parent of a node with index i, take (i - 1) / 2, rounding down. Repeat until node 0 is reached. In this example, 1 is added to the node with index 3.`;
	static stpsuedocode = `// roguh C++ code for the ST

void build(int arraySize) {

	bstart = 1;
	while (bstart < arraySize)
		bstart = bstart * 2;
	

	segtreesize = bstart * 2 - 1;
	bstart = bstart - 1;

	// fill the segtree with zeroes
	for (int i = 0; i < segtreesize; i++)
		segtree[i] = 0;
}

int queryRecursive(int currInd, 
                   int currLo, int currHi,
                   int queryLo, int queryHi) {

	if (currLo >= queryLo and currHi <= queryHi)
		return segtree[currInd];

	if (currLo > queryHi or currHi < queryLo)
		return 0;

	mid = (currLo + currHi) / 2;

	return queryRecursive(currInd * 2 + 1, 
	                      currLo, mid, 
	                      queryLo, queryHi) +
	       queryRecursive(currInd * 2 + 2, 
	                      mid + 1, currHi,
	                      queryLo, queryHi);

}

int query(lo, hi) {
	return queryRecursive(0,
	                      0, bstart, 
	                      queryLo, queryHi);
}

void update(int ind, int val) {
	ind = ind + bstart;
	while (ind >= 0) {
		segtree[ind] += val;
		if (ind == 0) break;
		ind = (ind - 1) / 2;
	}
}`

	constructor(ts) {

		this.ts = ts;
		
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

	addAbout() {

		var ts = this.ts;
		var texttowrite = AboutSegtree.aboutText.split("\n");

		this.addText(whereToWrite2, texttowrite[0]);
			
		var sptxt1 = this.makeSpoiler("What else are segment trees used for?", ['infosp1']);

		var infosp1 = document.createElement("p");
		infosp1.setAttribute("id", "infosp1");
		infosp1.setAttribute("style", "display: none;");
		infosp1.innerHTML = AboutSegtree.moreAboutSTUses;

		ts.appendChild(sptxt1);
		ts.appendChild(infosp1);

		var chr = document.createElement("hr");
		ts.appendChild(chr);

	}

	addAboutUpdate() {

		var ts = this.ts;
		var texttowrite = AboutSegtree.aboutText.split("\n");

		this.addText(whereToWrite2, texttowrite[1]);

		var moreinfo2 = document.createElement("p");

		var extinf = document.createElement("p");
		extinf.setAttribute("id", "extinf");
		extinf.innerHTML = AboutSegtree.moreAboutSTUpdate;

		var updiv = document.createElement("p");
		updiv.setAttribute("id", "updateinfovis");
		updiv.setAttribute("class", "maindiv");

		for (var i = 1; i <= 4; i++) {
			var cb = document.createElement("b");
			cb.innerHTML = "Step " + i + " ";
			cb.setAttribute("onclick", `

				AboutSegtree.updopsteps(${i}, 3, 1);

				`)
			updiv.appendChild(cb);
		}

		ts.appendChild(extinf);
		moreinfo2.appendChild(updiv);

		var updinfotxt = document.createElement("p");
		updinfotxt.setAttribute("class", "maindiv");
		updinfotxt.setAttribute("id", "updinfotxt");
		
		updinfotxt.innerHTML = "";
		moreinfo2.appendChild(updinfotxt);

		console.log(ts);
		ts.appendChild(moreinfo2);

		moreinfo2.innerHTML += "<div class='maindiv'><svg id=uexsvg width='256' height='256'></svg></div>";
		this.uexst = new Segtree("uexsvg", 8);

		var chr = document.createElement("hr");
		ts.appendChild(chr);

	}

	addAboutQuery() {



		var ts = this.ts;

		var hd = document.createElement("h2");
		hd.innerHTML = "Querying";
		ts.appendChild(hd);

		var texttowrite = AboutSegtree.aboutText.split("\n");
		this.addText(whereToWrite2, texttowrite[2]);

		var moreinfo3 = document.createElement("p");


		var queryinfotxt = document.createElement("p");
		queryinfotxt.innerHTML = "Any segment can be represented as a sequence of segments of length one. First, merge adjacent elements into segments of length two. Doing this will leave at most 2 segments of length one. Repeat the process for segments of length two (ignoring the segments of length one now), all the way up to segments of length n. This will leave at most 2 segments of each length to query.";
		queryinfotxt.setAttribute("id", "queryinfotxt");
		moreinfo3.appendChild(queryinfotxt);

		ts.appendChild(moreinfo3);

		ts.innerHTML += "<div class='maindiv'><svg id=qexsvg width='256' height='256'></svg></div>";
		this.qexst = new Segtree("qexsvg", 8);
		this.qexst.query(1, 6);

		var chr = document.createElement("hr");
		ts.appendChild(chr);

	}

	addPseudocode() {

		var ts = this.ts;


		var codep = document.createElement("p");
		var codeb = document.createElement("pre");
		var acode = document.createElement("code");
		acode.innerHTML = AboutSegtree.stpsuedocode;

		codeb.appendChild(acode);
		codep.appendChild(codeb);

		ts.appendChild(codeb);
		ts.innerHTML += "";

	}

	static updopsteps(numSteps, indToUpd, valToAdd) {
		this.uexst = new Segtree("uexsvg", 8)
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

	addText(where, what) {

		var newp = document.createElement("p");
		newp.innerHTML = what;
		document.getElementById(where).appendChild(newp);

	}

	setHTMLToUpdate() {
		
		var cp = document.getElementById(controlID);

		var cdiv = document.createElement("div");
		cdiv.setAttribute("class", "controlcontainer");

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
		
		var cp = document.getElementById(controlID);

		var cdiv = document.createElement("div");
		cdiv.setAttribute("class", "controlcontainer");

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

	interaction = new UserInteraction( new Segtree(stVisID) );
	helpabout = new AboutSegtree(document.getElementById(whereToWrite2));

	// interaction.createAboutSegtree();
	Resizer.sresize();
	interaction.setHTMLToQuery();
	interaction.setHTMLToUpdate();

	helpabout.addAboutUpdate();
	helpabout.addAboutQuery();
	// helpabout.addPseudocode();

}

