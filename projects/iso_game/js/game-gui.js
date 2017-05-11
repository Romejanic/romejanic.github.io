var offsetPos = -50;
var hideGUI = false;

var mouseX = -1, mouseY = -1;

function drawGUI(ctx) {
	ctx.globalAlpha = 1.0;
	ctx.translate(0, offsetPos);

	drawBlurryRect(ctx, 10, 0, 520, 50);
	
	ctx.fillStyle = "white";
	ctx.font = "25px Arial";
	ctx.fillText("Test", 15, 30);
	
	drawButton(ctx, "button!", 70, 5, 100, 40);
	
	ctx.translate(0, -offsetPos);
	if(offsetPos < 0 && !hideGUI) {
		offsetPos += (1/60) * 100;
		offsetPos  = Math.min(offsetPos, 0);
	} else if(offsetPos > -50 && hideGUI) {
		offsetPos -= (1/60) * 100;
		offsetPos  = Math.max(offsetPos, -50);
	}
	
	ctx.globalAlpha = 1.0 - Math.abs(offsetPos / 50);
	
	var playerPos = camera.getWorldPosOnScreen(player.position, ctx.canvas.width, ctx.canvas.height);
	ctx.font = "15px Arial";
	ctx.shadowColor = "black";
	ctx.shadowBlur = 5;
	ctx.fillTextCentered("Player", playerPos[0], playerPos[1] - 70);
	ctx.shadowBlur = 0;
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