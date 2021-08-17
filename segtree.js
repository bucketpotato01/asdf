
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
const whereToWrite = "outputText"; // ID of the div to put text onto


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

class UserInteraction {

	static segtree;

	static tellUser(message) {
		document.getElementById(whereToWrite).innerHTML = message;
	}

	static updateOperation() {
		
		UserInteraction.tellUser("");
		var val = parseInt(document.getElementById(valInputID).value);
		var ind = parseInt(document.getElementById(indInputID).value);
		
		if (isNaN(val) || isNaN(ind)) return;
		if (ind >= UserInteraction.segtree.arrSize || ind < 0) {
			UserInteraction.tellUser("Index out of bounds");
			return;
		}
		UserInteraction.segtree.upd(ind, val);

	}

	static queryOperation() {

		var l = parseInt(document.getElementById(lInputID).value);
		var r = parseInt(document.getElementById(rInputID).value);
		
		if (isNaN(l) || isNaN(r)) return;
		if (l >= UserInteraction.segtree.arrSize || 
			r >= UserInteraction.segtree.arrSize || 
			l < 0 || r < 0) {
			UserInteraction.tellUser("Index out of bounds");
			return;
		}

		if (l > r) {
			UserInteraction.tellUser("Left index should be less than right index.");
			return;
		}

		UserInteraction.segtree.unmarkall();

		var res = UserInteraction.segtree.query(l, r);

		UserInteraction.tellUser("Result of query is " + res);

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

	UserInteraction.segtree = new Segtree(stVisID);

	Resizer.sresize();

	var uexst = new Segtree("uexsvg", 8);
	var qexst = new Segtree("qexsvg", 8);
	qexst.query(1, 6);

}

