var ctx;
var drawCtx;

// 255, 125, 125
var colorR = 0;
var colorG = 0;
var colorB = 0;
var brushSize = 3;

var leftClickDown = false;
var rightClickDown = false;
var mouseOverClear = false;

var lastX = -1, lastY = -1;

function init() {
	var canvas = document.querySelector(".main");
	ctx = canvas.getContext("2d");
	
	var drawCanvas = document.createElement("canvas");
	drawCanvas.width = canvas.width, drawCanvas.height = canvas.height-50;
	drawCtx = drawCanvas.getContext("2d");
	
	canvas.onmousemove = mouseMove;
	canvas.onmousedown = mouseDown;
	canvas.onmouseup = mouseUp;
	canvas.oncontextmenu = canOpenContext;
	
	document.body.oncontextmenu = canOpenContext;
	document.getElementById("downloadBtn").onclick = downloadCanvas;
	
	drawCtx.fillStyle = "white";
	drawCtx.fillRect(0, 0, drawCtx.canvas.width, drawCtx.canvas.height);
	drawCtx.fillStyle = "black";
	drawCtx.font = "20px Arial";
	drawCtx.fillText("In front of you is a canvas.", 40, 40);
	drawCtx.fillText("Moving your mouse paints under your cursor.", 40, 70);
	drawCtx.fillText("Moving your mouse while holding left click changes color.", 40, 90);
	drawCtx.fillText("Moving your mouse while holding right click changes brush size.", 40, 110);
	drawCtx.fillText("Make a drawing.", 40, 140);
	
	requestAnimationFrame(update);
}

function update() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.drawImage(drawCtx.canvas, 0, 0);
	
	var grd = ctx.createLinearGradient(ctx.canvas.width, 0, ctx.canvas.width, ctx.canvas.height);
	grd.addColorStop(0, "rgba(204, 204, 204, 1.000)");
    grd.addColorStop(1, "rgba(94, 94, 94, 1.000)");
	
	ctx.fillStyle = grd;
	ctx.fillRect(0, ctx.canvas.height-50, ctx.canvas.width-50, 50);
	ctx.fillStyle = "red";
	ctx.fillRect(ctx.canvas.width-50, ctx.canvas.height-50, 50, 50);
	
	ctx.fillStyle = "white";
	ctx.fillText("Color: ", 12, ctx.canvas.height-20);
	ctx.fillText("Brush size: " + Math.floor(brushSize) + "px", 132, ctx.canvas.height-20);
	ctx.fillText("Click to clear:", ctx.canvas.width-180, ctx.canvas.height-20);
	ctx.fillStyle = "rgb(" + colorR + "," + colorG + "," + colorB + ")";
	ctx.fillRect(70, ctx.canvas.height-50, 50, 50);
	
	ctx.font = "50px Arial";
	ctx.fillStyle = !mouseOverClear ? "rgb(180,20,20)" : "white";
	ctx.fillText("!", ctx.canvas.width-32, ctx.canvas.height-7);
	ctx.font = "20px Arial";
	
	ctx.fillStyle = "black";
	ctx.fillRect(0, ctx.canvas.height-50, ctx.canvas.width, 1);
	ctx.fillRect(70, ctx.canvas.height-50, 1, 50);
	ctx.fillRect(120, ctx.canvas.height-50, 1, 50);
	ctx.fillRect(ctx.canvas.width-50, ctx.canvas.height-50, 1, 50);
	
	if(rightClickDown) {
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.arc(rightClickX, rightClickY, brushSize, 0, Math.PI*2, true);
		ctx.stroke();
	}
	
	requestAnimationFrame(update);
}

function mouseMove(e) {
	var pageX = e.pageX - ctx.canvas.offsetLeft;
	var pageY = e.pageY - ctx.canvas.offsetTop;

	if(lastX < 0 || lastY < 0) {
		lastX = pageX, lastY = pageY;
	}

	if(leftClickDown) {
		var xc = pageX / ctx.canvas.width;
		var yc = pageY / ctx.canvas.height;
		colorR = Math.floor(xc*255);
		colorG = Math.floor(yc*255);
		colorB = Math.floor((0.5+0.5*Math.sin(xc+yc*5))*255);
		return;
	}
	if(rightClickDown) {
		var deltaX = pageX - rightClickX;
		var deltaY = pageY - rightClickY;
		brushSize = Math.max(Math.sqrt(deltaX*deltaX+deltaY*deltaY), 1);
		//document.querySelector(".debug").innerText = delta;
		return;
	}
	if(pageX > ctx.canvas.width-50 && pageX < ctx.canvas.width && pageY > ctx.canvas.height-50 && pageY < ctx.canvas.height) {
		mouseOverClear = true;
		return;
	} else {
		mouseOverClear = false;
	}
	
	var avX = (lastX+pageX)/2, avY = (lastY+pageY)/2;
	drawCtx.fillStyle = "rgb(" + colorR + "," + colorG + "," + colorB + ")";
	drawCtx.beginPath();
	//drawCtx.lineWidth = brushSize;
	//drawCtx.moveTo(lastX, lastY);
 	//drawCtx.quadraticCurveTo(avX, avY, pageX, pageY);
	//drawCtx.lineTo(pageX, pageY);
	//drawCtx.stroke();
	drawCtx.arc(pageX, pageY, brushSize, 0, Math.PI*2, true);
	drawCtx.fill();
	
	lastX = pageX, lastY = pageY;
}

function mouseDown(e) {
	if(e.button == 0) {
		if(mouseOverClear) {
			drawCtx.fillStyle = "white";
			drawCtx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height-50);
		} else {
			leftClickDown = true;
		}
	} else if(e.button == 2 && !mouseOverToolbar(e)) {
		rightClickDown = true;
		rightClickX = e.pageX - ctx.canvas.offsetLeft;
		rightClickY = e.pageY - ctx.canvas.offsetTop;
	}
}

function mouseUp(e) {
	if(e.button == 0) {
		leftClickDown = false;
	} else if(e.button == 2) {
		rightClickDown = false;
	}
	lastX = e.pageX, lastY = e.pageY;
}

function downloadCanvas() {
	var link = document.getElementById("downloadBtn");
	link.href = drawCtx.canvas.toDataURL();
	link.download = "artwork.png";
}

function canOpenContext(e) {
	e.preventDefault();
}

function mouseOverToolbar(e) {
	return e.pageY > ctx.canvas.height-50 && e.pageY < ctx.canvas.height;
}

window.onload = init;