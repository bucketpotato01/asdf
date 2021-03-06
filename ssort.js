const SELECTIONSORT = 0;
const INSERTIONSORT = 1;
const QUICKSORT = 2;
const MERGESORT = 3;

const SET = 0;
const MARK = 1;

const canvasWidth = 300;
const canvasHeight = 150;
const defaultSize = 50;
const unmarkedColor = 'rgb(0, 0, 0)';
const markedColor = 'rgb(200, 0, 0)';
const partitionColor = 'rgb(148,0,211)';

const maxArraySize = 300;

var arr = []; // the current array
var arrsz = 0; // the current size of the array

var temp = []; // helper array for sorting
/*

	list of instructions for the sorting
	each element has list of elements to set
	and elements to mark

*/
var todo = [];
var whichOne = SELECTIONSORT;
var todoInd = 0; // which instruction to do right now
var animStarted = false; // is the automatic animation running?
var todoPrepared = false; // have the instructions been prepared?

// generates a random number
var randHelper = 1;
function grandint() {
	randHelper += 1;
	randHelper *= 696969420;
	randHelper %= 1000000007;
	return randHelper;
}

// generates a random array with the current length
function genarray(l) {

	var rem = [];

	for (var i = 1; i <= l; i++)
		rem.push(i);

	arr = [];
	arrsz = l;

	for (var i = l - 1; i >= 0; i--) {
		var cind = grandint() % (i + 1);
		arr.push(rem[cind]);
		rem[cind] = rem[i];
	}

}

// draws the current array
function drawArray() {

	var canvas = document.getElementById("array");
	var ctx = canvas.getContext("2d");

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	ctx.fillStyle = unmarkedColor;

	var eachWidth = canvasWidth / arrsz;
	var baseHeight = canvasHeight / (arrsz + 1);

	for (var i = 0; i < arrsz; i++) {
		ctx.fillRect(i * eachWidth, canvasHeight - (baseHeight * arr[i]), eachWidth, arr[i] * baseHeight);
	}

}

// marks the element at the given index on the canvas
// if domark is false, unmarks the element
function mark(ind, whatMark = markedColor) {

	var canvas = document.getElementById("array");
	var ctx = canvas.getContext("2d");

	ctx.fillStyle = whatMark;

	var eachWidth = canvasWidth / arrsz;
	var baseHeight = canvasHeight / (arrsz + 1);

	ctx.fillRect(ind * eachWidth, canvasHeight - (baseHeight * arr[ind]), eachWidth, arr[ind] * baseHeight);

}

function prepAll() {

	drawArray();

	animStarted = false;
	temp = [];
	todo = [];
	todoInd = 0;
	todoPrepared = false;

	prepareSort();

}

// generates an array with the current length
// resets all the animations
function makeArray() {

	if (arrsz == 0)
		arrsz = defaultSize;

	genarray(arrsz);
	
	prepAll();

}

// makes a reversed array with the current length
function makeReverseArray() {

	if (arrsz == 0)
		arrsz = defaultSize;

	arr = [];
	for (var i = 0; i < arrsz; i++)
		arr.push(arrsz - i);

	drawArray();

	prepAll();

}

// sets the algorithm to do
function setAlgo(algoChosen) {
	whichOne = algoChosen;
	makeArray();
}

// runs selection sort
function selectionSort() {

	for (var i = 0; i < arr.length; i++)
		temp.push(arr[i]);

	for (var i = 0; i < temp.length; i++) {

		todo.push([[], [i]]);
		var cmin = i;
		for (var j = i + 1; j < temp.length; j++) {

			todo.push([[], [cmin, j]]);
			if (temp[cmin] > temp[j])
				cmin = j;

		}

		todo.push([[ [i, temp[cmin]], [cmin, temp[i]] ], []]);
		var cv = temp[cmin];
		temp[cmin] = temp[i];
		temp[i] = cv;

	}
	
}

function insertionSort() {
	for (var i = 0; i < arr.length; i++)
		temp.push(arr[i]);

	for (var i = 0; i < temp.length; i++) {

		todo.push([[], [i]]);

		for (var j = i - 1; j >= 0; j--) {
			if (temp[j + 1] < temp[j]) {
				todo.push([ [[j, temp[j + 1]], [j + 1, temp[j]]],
				[j, j + 1] ]);
				var cv = temp[j];
				temp[j] = temp[j + 1];
				temp[j + 1] = cv;
			}
			else break;
			
		}

	}

	todo.push([[],[]]);
}

function mergeSortRec(l, r) {

	if (l == r) {
		todo.push([[], [l]]);
		return;
	}

	var mid = Math.floor((l + r) / 2);

	mergeSortRec(l, mid);
	mergeSortRec(mid + 1, r);

	var csorted = [];

	var p1 = l;
	var p2 = mid + 1;

	while (p1 <= mid || p2 <= r) {

		if (p1 > mid) {
			todo.push([[], [p2]]);
			csorted.push(temp[p2]);
			p2 += 1;
		}
		else if (p2 > r) {
			todo.push([[], [p1]]);
			csorted.push(temp[p1]);
			p1 += 1;
		}
		else {
			if (temp[p1] < temp[p2]) {
				todo.push([[], [p1, p2]]);
				csorted.push(temp[p1]);
				p1 += 1;
			}
			else {
				todo.push([[], [p1, p2]]);
				csorted.push(temp[p2]);
				p2 += 1;
			}
		}

	}

	topush = [];
	for (var i = 0; i < csorted.length; i++) {
		topush.push([l + i, csorted[i]]);
		temp[l + i] = csorted[i];
	}
	todo.push([topush, []]);


}

function mergeSort() {
	for (var i = 0; i < arr.length; i++)
		temp.push(arr[i]);
	mergeSortRec(0, arr.length - 1);
}

function quickSortRec(l, r) {

	if (l > r) return;

	if (l == r) {
		todo.push([[], [l]]);
		return;
	}

	var cind = l;
	var oput = r;

	while (cind < oput) {
		todo.push([[], [[cind, partitionColor], cind + 1, oput]]);

		if (temp[cind] > temp[cind + 1]) {
			todo.push([[ [cind, temp[cind + 1]], [cind + 1, temp[cind]] ],
						[cind, [cind + 1, partitionColor], oput]]);

			var cv = temp[cind + 1];
			temp[cind + 1] = temp[cind];
			temp[cind] = cv;

			cind += 1;
		}

		else {

			todo.push([[ [cind + 1, temp[oput]], [oput, temp[cind + 1]] ],

					[[cind, partitionColor], cind + 1, oput]]);

			var cv = temp[cind + 1];
			temp[cind + 1] = temp[oput];
			temp[oput] = cv;

			oput -= 1;
		}

	}

	quickSortRec(l, cind - 1);
	quickSortRec(cind + 1, r);

}

function quickSort() {
	for (var i = 0; i < arr.length; i++)
		temp.push(arr[i]);
	quickSortRec(0, arr.length - 1);
	todo.push([[],[]]);
}

function prepareSort() {
	if (todoPrepared) return;

	if (whichOne == SELECTIONSORT)
		selectionSort();
	if (whichOne == INSERTIONSORT)
		insertionSort();
	if (whichOne == MERGESORT)
		mergeSort();
	if (whichOne == QUICKSORT)
		quickSort();

	todoPrepared = true;
}

// takes the next step in sorting
function nextStep() {

	if (todoInd == todo.length) {
		animStarted = false;
		return false;
	}

	for (var i = 0; i < todo[todoInd][SET].length; i++)
		arr[todo[todoInd][SET][i][0]] = todo[todoInd][SET][i][1];
	
	drawArray();

	for (var i = 0; i < todo[todoInd][MARK].length; i++) {
		if (Array.isArray(todo[todoInd][MARK][i])) {
			mark(todo[todoInd][MARK][i][0], todo[todoInd][MARK][i][1]);
		}
		else
			mark(todo[todoInd][MARK][i]);
	}
	

	todoInd += 1;

	return true;

}

// next step of the animation
function doanim() {

	if (animStarted == false) return;

	var canvas = document.getElementById("array");
	var ctx = canvas.getContext("2d");

	var keepdoing = nextStep();
	if (keepdoing == true) {

		window.requestAnimationFrame(doanim);

	}

}

// start the animation
function startAnim() {
	if (animStarted == true) return;
	animStarted = true;
	doanim();
}

// stop the animation
function stopAnim() {
	animStarted = false;
}

// generates an array with the user-given size
function regenArray() {
	
	var userChosenSize = document.getElementById("chosenSize").value;
	userChosenSize = parseInt(userChosenSize);

	var ok = true;

	if (typeof(userChosenSize) != "number") ok = false;
	if (userChosenSize < 1 || userChosenSize > maxArraySize) ok = false;
	if (isNaN(userChosenSize)) ok = false;

	if (ok == false) {
		arrsz = 0;
	}
	else {
		arrsz = userChosenSize;
	}

	makeArray();

}