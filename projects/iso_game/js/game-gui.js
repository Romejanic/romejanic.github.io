var offsetPos = -50;
var hideGUI = false;

var mouseX = -1, mouseY = -1;

function drawGUI(ctx) {
	drawBlurryRect(ctx, 10, offsetPos, 520, 50);
	
	ctx.fillStyle = "white";
	ctx.font = "25px Arial";
	ctx.fillText("Test", 15, offsetPos + 30);
	
	drawButton(ctx, "button!", 70, offsetPos + 5, 100, 40);
	
	if(offsetPos < 0 && !hideGUI) {
		offsetPos += (1/60) * 100;
		offsetPos  = Math.min(offsetPos, 0);
	} else if(offsetPos > -50 && hideGUI) {
		offsetPos -= (1/60) * 100;
		offsetPos  = Math.max(offsetPos, -50);
	}
}

function drawBlurryRect(ctx, x, y, w, h) {
	ctx.filter = "blur(5px) brightness(25%)";
	ctx.drawImage(gl.canvas, x, y, w, h, x, y, w, h);
	ctx.filter = "none";
}

function drawButton(ctx, text, x, y, w, h) {
	ctx.fillStyle = "black";
	if(mouseInsideRect(x, y, w, h)) {
		ctx.fillStyle = "gray";
	}
	ctx.fillRect(x, y, w, h);
	ctx.fillStyle = "white";
	ctx.fillTextCentered(text, x+w/2, y+h-h/4);
}

function mouseInsideRect(x, y, w, h) {
	return mouseX > x && mouseY > y && mouseX < x+w && mouseY < y+h;
}