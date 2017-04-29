var offsetPos = -50;

var mouseX = -1, mouseY = -1;

function drawGUI(ctx) {
	ctx.fillStyle = "white";
	ctx.globalAlpha = 0.75;
	ctx.fillRect(10, offsetPos, 520, 50);
		
	ctx.globalAlpha = 1.0;
	ctx.fillStyle = "white";
	ctx.font = "25px Arial";
	ctx.fillText("Test", 15, offsetPos + 30);
	
	drawButton(ctx, "button!", 70, offsetPos + 5, 100, 40);
	
	if(offsetPos < 0) {
		offsetPos += (1/60) * 100;
		offsetPos  = Math.min(offsetPos, 0);
	}
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